# Kubernetes HPA + Metrics Server + Service Load Testing - Quick Notes

This note captures a practical troubleshooting and validation flow for fixing Metrics API issues, enabling HPA CPU scaling, exposing an app via `ClusterIP`, and generating traffic to verify autoscaling.

---

## 1) Fix `kubectl top` / Metrics API Issue

### Install Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Common TLS Fix (EKS)

Edit Metrics Server deployment:

```bash
kubectl edit deployment metrics-server -n kube-system
```

Add these args under container arguments:

- `--kubelet-insecure-tls`
- `--kubelet-preferred-address-types=InternalIP`

### Verify Metrics API

```bash
kubectl get apiservice v1beta1.metrics.k8s.io
```

Expected:

- `AVAILABLE: True`

### Validate Metrics Commands

```bash
kubectl top nodes
kubectl top pods
```

---

## 2) Fix HPA `cpu: <unknown>` Issue

### Typical Root Causes

- Metrics Server not healthy
- Target pods are not Ready
- CPU requests are missing in workload spec

### Required Resources in Deployment

```yaml
resources:
  requests:
    cpu: 250m
  limits:
    cpu: 500m
```

### Verify HPA Status

```bash
kubectl describe hpa myapp-hpa
```

Healthy signals:

- `cpu: 0% / 70%` (or current value against target)
- `ScalingActive: True`

---

## 3) Create `ClusterIP` Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  type: ClusterIP
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

Verify:

```bash
kubectl get svc myapp-service
```

---

## 4) Test Service From Inside Cluster

Create a temporary pod:

```bash
kubectl run test --rm -it --image=busybox -- /bin/sh
```

Inside pod:

```bash
wget -qO- http://myapp-service
```

---

## 5) Generate Load for HPA

### Basic Continuous Load

```bash
kubectl run load-generator --rm -it --image=busybox -- /bin/sh
```

Inside pod:

```bash
while true; do wget -q -O- http://myapp-service; done
```

### Stronger Parallel Load

```bash
while true; do wget -q -O- http://myapp-service & done
```

### Background Stress Pod

```bash
kubectl run stress --image=busybox -- /bin/sh -c "while true; do wget -q -O- http://myapp-service; done"
```

---

## 6) Monitor Autoscaling

```bash
kubectl get hpa -w
```

Expected behavior:

- CPU utilization approaches/exceeds target (for example, `70%+`)
- Replica count increases based on load

---

## 7) Key Concept: CPU Utilization Formula

```text
CPU % = (actual usage / requested CPU) x 100
```

Example:

- `4m / 250m ≈ 1-2%` -> too low, likely no scale-up

---

## 8) Practical Tips

- Lower CPU requests can make utilization percentage rise faster
- Lightweight apps (like simple NGINX responses) may need high request volume to scale
- Always generate test traffic via Service DNS, not direct Pod IP

---

## 9) Quick Debug Checklist

```bash
kubectl top pods                 # must return data
kubectl get apiservice           # metrics API should be AVAILABLE=True
kubectl get pods                 # all relevant pods should be Ready
kubectl describe hpa myapp-hpa   # ScalingActive should be True
```

---

## Final Status Template

- [ ] Metrics Server working
- [ ] HPA working
- [ ] Service working
- [ ] Scaling verified under load

