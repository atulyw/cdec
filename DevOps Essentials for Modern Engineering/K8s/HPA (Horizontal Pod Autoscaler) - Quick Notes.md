# HPA (Horizontal Pod Autoscaler) - Detailed Notes

This note explains a production-style `autoscaling/v2` HPA manifest: what it scales, how CPU + memory targets interact, and how `behavior` controls scale-up vs scale-down speed.

---

## `basic-hpa.yaml` (start here)

```yaml
# basic-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
  labels:
    app: myapp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

---

## What is HPA?

The **HorizontalPodAutoscaler** automatically adjusts the number of Pods in a workload (commonly a `Deployment`) based on observed load signals such as **CPU**, **memory**, and (with extra plumbing) custom/external metrics.

In this manifest, HPA scales **`Deployment/myapp`** using **CPU utilization** and **memory utilization** targets.

---

## 1) Target workload (`scaleTargetRef`)

```yaml
scaleTargetRef:
  apiVersion: apps/v1
  kind: Deployment
  name: myapp
```

Meaning:

- The HPA is **attached to** `Deployment/myapp`.
- HPA changes scaling by updating that Deployment’s **desired replica count** (`spec.replicas`).

---

## 2) Replica limits (`minReplicas`, `maxReplicas`)

```yaml
minReplicas: 2
maxReplicas: 10
```

Rules:

- **Minimum**: HPA will not scale below **2** Pods (even if load is very low).
- **Maximum**: HPA will not scale above **10** Pods (even if load is very high).

---

## 3) Metrics (scaling signals)

You configured **two resource metrics**:

### CPU scaling

```yaml
- type: Resource
  resource:
    name: cpu
    target:
      type: Utilization
      averageUtilization: 70
```

Meaning:

- HPA tries to drive **average CPU utilization** toward **70%** (relative to each Pod’s CPU **request**, when requests exist).

### Memory scaling

```yaml
- type: Resource
  resource:
    name: memory
    target:
      type: Utilization
      averageUtilization: 80
```

Meaning:

- HPA tries to drive **average memory utilization** toward **80%** (relative to each Pod’s memory **request**, when requests exist).

### Multiple metrics: “highest demand wins”

When you list multiple metrics, HPA effectively behaves like **OR / worst-case planning**:

- It computes a **recommended replica count per metric**.
- It chooses the **largest** recommended replica count so you don’t under-scale when *any* metric is hot.

Example intuition:

- CPU average is fine, but memory average is high → HPA scales based on what memory “needs”.

Important nuance (interview-level):

- HPA is not a literal “if CPU > 70% then +1” rule every loop; it uses a **ratio/target** model and applies **policies + stabilization** on top.

---

## 4) Scaling behavior (`behavior`) — advanced control

`behavior` limits how *fast* replicas can change and adds *stabilization* to reduce flapping.

### Scale up

```yaml
scaleUp:
  stabilizationWindowSeconds: 60
  policies:
    - type: Percent
      value: 100
      periodSeconds: 15
```

Meaning:

- **`stabilizationWindowSeconds: 60`**: HPA considers recent recommendations over ~60 seconds to avoid reacting to ultra-short spikes.
- **Policy `Percent 100` every `15s`**: in each 15-second window, scale-up is capped at **+100% of current replicas** (roughly **double at most** per step), until it reaches the desired count (still bounded by `maxReplicas`).

Example:

- Current replicas = **2** → next allowed step can go up to **4** (fast growth).

### Scale down

```yaml
scaleDown:
  stabilizationWindowSeconds: 300
  policies:
    - type: Percent
      value: 10
      periodSeconds: 60
```

Meaning:

- **`stabilizationWindowSeconds: 300`**: wait ~**5 minutes** of “consistently safe to scale down” signal before committing to scale-down changes (reduces churn).
- **Policy `Percent 10` every `60s`**: scale-down is capped at **10% of current replicas per minute** (slow, conservative).

Example intuition:

- **10** Pods → about **9** after a minute → about **8** the next minute (slow descent), until `minReplicas` stops you at **2**.

---

## Full lifecycle example (mental model)

Initial:

- Pods = **2** (because `minReplicas: 2`)

Traffic increases:

- Observed utilization rises above targets (CPU and/or memory, depending on which metric demands more replicas).
- HPA increases replicas quickly (bounded by scale-up policy), up to `maxReplicas: 10`.

Traffic stabilizes:

- Utilization trends back toward targets → HPA may stop changing replicas.

Traffic drops:

- HPA waits through the **scale-down stabilization** window, then reduces replicas **slowly** (scale-down policy), but **not below** `minReplicas: 2`.

---

## Hidden requirement: Metrics Server (for CPU/memory)

For **resource metrics** (`cpu`, `memory`) to work, the cluster needs a working **Metrics API** provider (typically **metrics-server**).

Quick checks:

```bash
kubectl get apiservices | grep metrics.k8s.io
kubectl top pods
```

If metrics aren’t available, `kubectl top` fails and HPA won’t have the signals it needs to scale correctly.

---

## Hidden requirement: `resources.requests` (strongly recommended)

For `averageUtilization` targets, Kubernetes computes utilization against the Pod’s **requested** CPU/memory.

If containers don’t define requests (or they’re inconsistent), utilization math becomes misleading and HPA behavior becomes unreliable.

Recommended pattern on the Deployment’s container:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

Notes:

- You *can* omit limits depending on your policy, but **requests are the key** for utilization-based HPA.

---

## Hands-on demo (end-to-end): deploy app → apply HPA → load test → watch scaling

You’ll do **four** big steps:

- Deploy an app (**CPU + memory requests are required** for reliable `averageUtilization` HPA)
- Expose a `Service`
- Apply your `basic-hpa.yaml`
- Generate load and watch replicas change

### Step 1: Create demo app (`deployment.yaml`)

HPA utilization targets are calculated against **requests**. If requests are missing/messy, the demo looks “broken” even when HPA is fine.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: app
          image: nginx:1.25
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
```

Apply:

```bash
kubectl apply -f deployment.yaml
```

### Step 2: Expose service (`service.yaml`)

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 80
```

Apply:

```bash
kubectl apply -f service.yaml
```

### Step 3: Apply your HPA (`basic-hpa.yaml`)

```bash
kubectl apply -f basic-hpa.yaml
```

### Step 4: Verify HPA is wired up

```bash
kubectl get hpa
kubectl describe hpa myapp-hpa
```

You should see fields like **TARGETS** (metrics vs targets) and **REPLICAS** (current vs desired).

### Step 5: Ensure Metrics Server exists (CPU/memory signals)

```bash
kubectl get apiservices | grep metrics.k8s.io
kubectl top pods
```

If `kubectl top` fails, fix **metrics-server** first (common on fresh clusters). Without Metrics API, CPU/memory HPA won’t behave.

### Step 6: Generate load (most important)

#### Method A: simple steady load (busybox + wget)

```bash
kubectl run load-generator --image=busybox:1.36 -it --restart=Never --rm -- /bin/sh
```

Inside the container:

```sh
while true; do wget -q -O- http://myapp-service.default.svc.cluster.local/ >/dev/null; done
```

Notes:

- If everything is in `default`, `http://myapp-service` often works too — the FQDN is the most reliable.

#### Method B: burst many parallel requests (stronger spike)

Still inside busybox:

```sh
for i in $(seq 1 50); do
  wget -q -O- http://myapp-service.default.svc.cluster.local/ >/dev/null &
done
wait
```

You can loop that `for` burst to keep pressure high.

#### Method C (don’t use for this demo): “CPU busy loop” in a random pod

Running `while true; do :; done` inside a **separate** busybox pod usually **does not increase CPU** on your `myapp` pods, so it **won’t** make this HPA demo work. Load should hit **`myapp-service`** (HTTP) or otherwise exercise the app containers.

### Step 7: watch scaling live

Terminal A:

```bash
kubectl get hpa -w
```

Terminal B:

```bash
kubectl get pods -w
```

### What you should see (typical)

- **Initially**: ~**2** pods (matches `minReplicas` / starting deployment replicas)
- **Under sustained load**: replicas increase (bounded by `maxReplicas` and scale-up policies/stabilization)
- **After stopping load**: because your HPA has a **300s** scale-down stabilization window and **slow** scale-down policy, replicas usually **drop slowly** and won’t go below **`minReplicas: 2`**

### Bonus: confirm the metric signal HPA reacts to

```bash
kubectl top pods
```

You should see CPU/memory rise on `myapp-*` pods while load runs.

### Common mistakes (why “HPA does nothing”)

- **No CPU/memory requests** on the app container → utilization math is wrong/unstable
- **Metrics Server / Metrics API missing** → no usable resource metrics
- **Load too low / too short** → no sustained signal
- **Stabilization + policies** → changes can look “delayed”, especially scale-down

---

## HPA metrics types overview

| Metric type | What it measures | Example | When to use | Source required |
|---|---|---|---|---|
| **Resource** | CPU / memory usage per Pod (aggregated/averaged for the target workload) | CPU average utilization = **70%** | Default autoscaling on node resources | **Metrics Server** (Metrics API: `metrics.k8s.io`) |
| **Pods** | A **custom metric** interpreted **per Pod** (then averaged across Pods) | Requests per second **per pod** | Scale on app signals that map cleanly to “per replica” | **Custom Metrics API** (`custom.metrics.k8s.io`) + adapter (often Prometheus Adapter) |
| **Object** | A custom metric tied to a **Kubernetes object** (e.g., Ingress) | Ingress **requests/sec** | Traffic-based scaling when the signal is naturally “object scoped” | **Custom Metrics API** (`custom.metrics.k8s.io`) + adapter |
| **External** | A metric **not** tied to Kubernetes objects (external systems) | Queue depth, **Kafka consumer lag** | Event-driven / off-cluster signals | **External Metrics API** (`external.metrics.k8s.io`) + adapter |

### Explanatory notes (read this once, remember forever)

- **Resource metrics are the “batteries included” path**: they come from **metrics-server** and work for CPU/memory targets like `averageUtilization`. For CPU/memory utilization, you usually want consistent **`resources.requests`** on your containers.
- **Pods metrics are for app-level scaling**, but the metric must be published in a way the control plane can query via the **custom metrics pipeline** (not just Prometheus UI). HPA then reasons about it **per Pod**.
- **Object metrics are useful when the signal is naturally attached to an object** (Ingress, Service, etc.). You still need the **custom metrics** stack to expose that metric to Kubernetes.
- **External metrics are for “outside Kubernetes” signals** (SQS, Kafka, cloud metrics). These require the **external metrics** stack; HPA references the metric by name/selector and scales off that value.
- **Practical rule**: if you’re not running Prometheus Adapter / a metrics adapter and enabling those APIs, stick to **Resource** metrics only.

---

## Interview takeaways

- HPA scales the **Pod count** for a target workload (`Deployment`, `ReplicaSet`, `StatefulSet`, etc.).
- `minReplicas` / `maxReplicas` are **hard bounds**.
- Multiple metrics → HPA uses the **most demanding** recommendation (largest desired replicas).
- `behavior` makes scale-up **fast** and scale-down **slow** (common production pattern).
- CPU/memory HPA needs **metrics-server** (Metrics API) and sensible **`resources.requests`**.
