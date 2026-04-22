# Kubernetes Workload Types: Deployment, StatefulSet & DaemonSet

A practical study guide for students and junior engineers learning **when** and **why** to choose each workload.

---

## 1. Introduction

### What are Kubernetes workloads?

A **workload** is your declared intent: *“Run this application in the cluster, keep it healthy, and update it this way.”* You write YAML (or use tools that generate it), and the control plane continuously matches the real cluster to that intent.

### Why workloads exist

Without workload controllers, you would create Pods by hand—and they would not come back if a node failed, would not roll out new versions safely, and would not scale as a group. **Workloads** give you:

- **Operations you expect in production**: scale, update, heal, order, or “one per node.”
- **A stable API**: teams agree on `Deployment` / `StatefulSet` / `DaemonSet` instead of custom scripts.

### Pods vs workloads (very basic)

| Idea | Simple explanation |
|------|---------------------|
| **Pod** | The smallest runnable unit—usually one or more containers sharing network/storage on one node. **Ephemeral by nature**: it can be deleted and recreated anytime. |
| **Workload** | A **controller** (Deployment, StatefulSet, DaemonSet, Job, etc.) that **creates and manages Pods** for you. You almost always talk to the workload, not individual Pods. |

**Think of it this way:** the **Pod** is the “process on a machine.” The **workload** is the “team manager” that decides how many processes, how to replace them, and in what order.

---

## 2. Deployment (Stateless Workloads)

### Simple definition

A **Deployment** runs **multiple interchangeable copies** of the same app. Any Pod can serve traffic; Kubernetes may replace Pods anytime. Names and order do not matter to the application’s correctness.

### Real-world analogy (Uber / food delivery)

Imagine **many identical drivers** for a delivery app. The customer cares that *a* driver shows up—not *driver #7 forever*. If one driver goes offline, the platform assigns another. **Deployment** is that model: **replaceable workers**, same app version, scale with demand.

### Why Deployment is the most common choice

Most public-facing software is **stateless at the Pod layer**: session or data lives in a database, cache, or object store. Deployment matches that pattern, supports **fast scaling** and **rolling updates**, and is the first tool teams reach for for web stacks and microservices.

### Detailed key features

#### ReplicaSet relationship

- You define a **Deployment**; Kubernetes creates and owns a **ReplicaSet**.
- The **ReplicaSet**’s job is simple: **keep N Pods** running that match a label selector.
- When you change the Pod template (e.g. new image), the Deployment creates a **new** ReplicaSet and moves traffic gradually (**rolling update**). Old ReplicaSets may stick around briefly for rollback history.

*Beginner takeaway:* You rarely create ReplicaSets by hand in real apps—**Deployment is the user-facing knob**.

#### Scaling (manual and auto — HPA)

- **Manual:** Change `replicas` in the Deployment spec (or `kubectl scale`). The ReplicaSet adds or removes Pods.
- **Auto:** **Horizontal Pod Autoscaler (HPA)** watches metrics (often CPU/memory, sometimes custom metrics) and adjusts `replicas` for you. HPA talks to the **Deployment**, not to Pods directly.

#### Rolling updates and rollbacks

- **Rolling update:** New Pods come up while old ones drain—controlled by fields like `maxSurge` and `maxUnavailable` (defaults are usually sane for beginners).
- **Rollback:** If the new version is bad, you can roll back to a previous ReplicaSet revision (Kubernetes keeps revision history on the Deployment).

#### Self-healing

If a node dies or a Pod crashes, the ReplicaSet **creates replacements** until the count matches `replicas`. You do not SSH in to “restart” the fleet.

### Benefits of Deployment

- **High availability:** Spread across nodes (with scheduling rules), multiple Pods reduce single-Pod failure impact.
- **Easy scaling:** One number (`replicas`) or HPA to follow load.
- **Zero-downtime deployments:** Rolling updates avoid “big bang” cutovers when configured well.
- **Cost efficiency:** Scale **down** when idle; you pay for what you run (at the Pod/resource level).

### When to use Deployment

- Web frontends, **REST/GraphQL APIs**, **microservices** that store state **outside** the Pod.
- Background **workers** that pull jobs from a queue and do not need a stable Pod name or local disk identity.
- Anything where **any replica is as good as any other**.

### When NOT to use Deployment

- Each replica needs a **stable network identity** and **its own persistent disk** (e.g. primary/replica database with local storage).
- The app **breaks** if Pods are created or deleted in random order.
- You need **exactly one Pod per node** for infrastructure (that is DaemonSet territory).

### Real-world use cases

- **E-commerce** catalog and checkout APIs behind a load balancer.
- **SaaS** multi-tenant services with state in PostgreSQL / Redis.
- **CI runners** or generic workers (often Deployment + queue).

### Minimal YAML example (key fields only)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-api
  template:
    metadata:
      labels:
        app: web-api
    spec:
      containers:
        - name: api
          image: myregistry/web-api:1.2.0
```

### Step-by-step: what happens when you deploy

1. You `kubectl apply` the Deployment; it is stored in the API server.
2. The **Deployment controller** creates or updates a **ReplicaSet** with the same selector and template.
3. The ReplicaSet sees **too few Pods** and schedules new Pods onto nodes.
4. **Kubelet** starts containers; readiness probes (if defined) gate Service endpoints.
5. On an **image change**, Deployment creates a new ReplicaSet and performs a **rolling update** Pod by Pod.
6. If a Pod vanishes, the ReplicaSet **recreates** it to match `replicas`.

---

## 3. StatefulSet (Stateful Workloads)

### Simple definition

A **StatefulSet** runs replicas that are **not fungible**: each has a **stable identity**, **predictable DNS**, and often **its own persistent volume**. Creation, deletion, and scaling follow a **defined order**.

### Real-world analogy (bank account / identity)

A **bank account number** is yours—not “any random account.” **Statements** attach to *your* identity, and **order** matters for some operations (e.g. verified identity before issuing a card). StatefulSet gives Pods that kind of **stable seat** in the cluster, not anonymous workers.

### Why StatefulSet exists (problem vs Deployment)

**Deployment** assumes: replace a Pod, lose local identity—**fine** for stateless apps. **Databases and clustered middleware** often need:

- **Stable hostname** so peers trust replication.
- **Dedicated disk** per replica so data is not lost when a Pod moves incorrectly.
- **Ordered** bootstrap (e.g. seed node first).

StatefulSet encodes those needs. It is **not** “Deployment + magic”—you still must run the software correctly (operators, config, backups).

### Detailed key features

#### Stable pod identity

Pods get names like `myapp-0`, `myapp-1`, `myapp-2`. The **ordinal** is stable for the life of that “slot” in the StatefulSet.

#### Stable network (DNS)

With a **headless Service** (`clusterIP: None`) and `serviceName` set on the StatefulSet, DNS often resolves **per-Pod** names (e.g. `myapp-0.myapp.default.svc.cluster.local`). Peers connect to **specific** members.

#### Persistent storage (PVC)

`volumeClaimTemplates` creates a **PersistentVolumeClaim** per Pod ordinal. **Data** can stay bound to that replica’s identity (storage class and policy matter in real clusters).

#### Ordered deployment and scaling

- **Scale up:** Often `0 → 1 → 2` so later members can discover healthy predecessors.
- **Scale down / delete:** Often **highest ordinal first**, reducing risk of split-brain or unsafe teardown (behavior is important to verify for your app version).

### Benefits of StatefulSet

- **Data persistence:** Each replica can keep durable storage aligned to its identity.
- **Predictable scaling:** Order reduces “everyone started at once” chaos for clustered software.
- **Reliable recovery:** Replace `myapp-1` and it comes back as **the same logical member** (name + claim), which operators and apps can reason about.

### When to use StatefulSet

- **Databases** and **distributed stores** where members have roles and persistent disks (when you are not using a cloud-managed DB).
- **Kafka**, **ZooKeeper**, **etcd**, **Elasticsearch** (often with operators)—patterns that expect stable peers.

### When NOT to use StatefulSet

- Classic **stateless** HTTP services (use Deployment).
- You only need **one** replica forever—sometimes a **single Pod** or other patterns are simpler (still not ideal for production without HA story).
- You want **one agent per node** (that is **DaemonSet**).

*Reality check:* Many teams use **managed databases** and keep application tiers on Deployments—StatefulSet is powerful but **operational overhead** is higher.

### Real-world use cases

- **MongoDB** replica set, **PostgreSQL** with Patroni, **Redis** with Sentinel (patterns vary).
- **Kafka brokers**, **ZooKeeper**, **NATS** clusters—combined with good networking and storage classes.

### Minimal YAML example (key fields only)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db-headless
  replicas: 3
  selector:
    matchLabels:
      app: db
  template:
    metadata:
      labels:
        app: db
    spec:
      containers:
        - name: db
          image: myregistry/db:2.0
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

*Headless Service* (`db-headless`) is required in practice for stable DNS; it is not shown here to keep the snippet small—your course will add it next.

### Step-by-step: pod creation sequence (typical scale-up)

1. StatefulSet ensures **Pod `db-0`** exists and is **Ready** before **`db-1`** is created (ordered readiness).
2. **`db-1`** starts, can resolve **`db-0`** via DNS, joins cluster per app logic.
3. **`db-2`** follows the same pattern.
4. Each Pod mounts its **own PVC** from `volumeClaimTemplates` (created with matching ordinal).
5. On **scale down**, Kubernetes often removes **highest index first**; your app must tolerate member loss safely.

---

## 4. DaemonSet (Node-Level Workloads)

### Simple definition

A **DaemonSet** ensures **one Pod per node** (or per matching node), running **system-level** or **node-local** work. You think in **nodes**, not “how many replicas in total.”

### Real-world analogy (security guard per building)

Every building in a campus needs **its own guard at the door**—not three guards shared randomly. **DaemonSet** = **one guard per building (node)**.

### Why DaemonSet is needed

Some software must see **host-level** data: logs on disk, node metrics, network setup. Running **one instance per node** guarantees **full coverage** and **fair load** per machine.

### Detailed key features

#### One pod per node

By default, **each eligible node** gets exactly one DaemonSet Pod. You can narrow **which nodes** using `nodeSelector`, **affinity**, or **taints/tolerations**.

#### Auto add/remove with nodes

- **New node joins:** Scheduler + DaemonSet controller place the DaemonSet Pod on it.
- **Node removed:** That Pod goes away with the node; no manual cleanup for that slot.

#### Node-specific workloads

Mounts like **hostPath**, access to **node IP**, or **privileged** security contexts (use carefully) are common patterns—always follow your org’s security standards.

### Benefits of DaemonSet

- **Full node coverage:** No “blind” machines in the cluster for that function.
- **Automatic scaling with cluster:** More nodes ⇒ more Pods, automatically.
- **Ideal for infra-level services:** logging, metrics, CNI plugins, security agents.

### When to use DaemonSet

- **Log shipping** (e.g. Fluent Bit, Fluentd), **node exporters**, **security** agents.
- **Network plugins** or components that must run on every node.

### When NOT to use DaemonSet

- **Stateless app** that should scale with **HTTP traffic** (use **Deployment** + **HPA**).
- **Stateful cluster** with named peers and PVCs (use **StatefulSet** or operators).
- You only want **one copy in the whole cluster** (consider other patterns; DaemonSet is **per node**).

### Real-world use cases

- **Prometheus Node Exporter**, **Datadog** / **Elastic** agents, **Falco**, **Cilium/Calico** components (depending on install method).

### Minimal YAML example (key fields only)

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-agent
spec:
  selector:
    matchLabels:
      app: log-agent
  template:
    metadata:
      labels:
        app: log-agent
    spec:
      containers:
        - name: agent
          image: myregistry/log-agent:1.0
```

### Behavior when a new node is added

1. The node becomes **Ready** in Kubernetes.
2. The **DaemonSet controller** notices a node without a matching DaemonSet Pod.
3. It **schedules** the Pod on that node (respecting selectors and tolerations).
4. **Kubelet** starts the container; that node now participates in cluster-wide log/metric collection (or whatever the DaemonSet does).

---

## 5. Deep Comparison Table

| Topic | Deployment | StatefulSet | DaemonSet |
|-------|------------|-------------|-----------|
| **Workload type** | Stateless (typical) | Stateful | Node-level / infra |
| **App type** | Stateless at Pod layer | Stateful / clustered | Not about app state—about **per-node** duty |
| **Pod identity** | Random names; interchangeable | Stable ordinal names (`app-0`, `app-1`, …) | One per node; identity tied to **which node** |
| **Storage** | Usually none on Pod; external DB/cache | **PVC per replica** common | Often host paths or light local config |
| **Scaling behavior** | Set `replicas` or HPA by metrics | Set `replicas`; **ordered** add/remove | **Grows with node count** (not “pick a number” like traffic) |
| **Deployment strategy** | Rolling update (default), rollback | Ordered rollout; **not** the same as Deployment rollouts | Version changes roll **per node** (surge on nodes matters) |
| **Best use case** | Web, APIs, microservices, workers | DBs, Kafka, ZooKeeper-style systems | Monitoring, logging, security, networking agents |
| **Complexity level** | **Low–medium** (baseline K8s) | **High** (storage, DNS, ordering, app semantics) | **Medium** (node selectors, tolerations, host access) |

---

## 6. Visual Understanding (In Words, No Images)

### How pods behave in each workload

- **Deployment:** A **pool** of identical Pods—like **many dots** behind one load balancer. Dots can disappear; new dots appear; users rarely notice **which** dot.
- **StatefulSet:** A **numbered row** of Pods—**seat 0, seat 1, seat 2**—each with a **locker** (PVC). Replacing seat 1 means “new process, **same seat label** and **same locker**.”
- **DaemonSet:** A **grid**: **each row is a node**, and **one Pod** sits on **every row** you care about—full **checkerboard** coverage.

### Lifecycle differences

- **Deployment:** Fast churn is normal; **version** changes via ReplicaSet generations.
- **StatefulSet:** **Gentler, ordered** churn; identity and disks **outlive** a single Pod process.
- **DaemonSet:** Lifecycle tied to **cluster topology**—nodes in, Pods in; nodes out, Pods out.

### Scaling differences

- **Deployment / HPA:** Scale because **CPU, RPS, queue depth** went up.
- **StatefulSet:** Scale because you need **more members** in the cluster (and storage/network planned).
- **DaemonSet:** “Scale” usually means **more nodes**—or changing **which** nodes run the DaemonSet.

---

## 7. Common Mistakes Students Make

| Mistake | Why it hurts | Better instinct |
|--------|----------------|-----------------|
| **Using Deployment for a primary database** | Random Pod names, shared emptyDir, wrong failover story | Managed DB or StatefulSet + operator + backups |
| **Ignoring persistence** | You thought “Kubernetes saved my data”—**only if** PVCs/backups/ops do | Stateless in Pod; **durable** in volumes or external services |
| **Treating DaemonSet like “replicas = 5”** | Five Pods on **five nodes**, not “five total somewhere” | Ask: “Do I need **per node** or **per request**?” |
| **Forgetting headless Service for StatefulSet** | Peers cannot resolve stable DNS | Pair StatefulSet with `serviceName` + headless Service |
| **Expecting zero-downtime without probes** | Traffic hits not-ready Pods | Add readiness/liveness as you progress in the course |

---

## 8. Quick Revision Section

### One–two line summaries

- **Deployment:** Many **swap-in** copies of the same app; scale with load; rolling updates—**default for stateless**.
- **StatefulSet:** **Numbered** replicas with **stable DNS** and **disks**; ordered life cycle—**for clustered stateful systems**.
- **DaemonSet:** **One Pod per node**—**full coverage** for logs, metrics, agents.

### Memory tricks

- **Deployment** → **D** = **Disposable** replicas (any driver delivers the pizza).
- **StatefulSet** → **S** = **Same seat, same locker** (bank account, not anonymous).
- **DaemonSet** → **D**aemon = **D**oor on **each** **node** (guard per building).

---

## 9. Interview Questions

**1. When would you choose Deployment over StatefulSet?**  
When Pods are **interchangeable**, hold **no unique local data**, and you want **simple scaling and rolling updates**—typical web APIs and microservices.

**2. What problem does StatefulSet solve that Deployment does not?**  
**Stable network identity**, **per-replica persistent storage**, and **ordered** scale/teardown for applications that depend on **specific members** (e.g. replication topologies).

**3. How does a DaemonSet scale differently from a Deployment?**  
DaemonSet scales with **node count** (one Pod per eligible node). Deployment scales with **`replicas` / HPA** based on **application load**, not machines.

**4. What is a ReplicaSet, and how does it relate to Deployment?**  
ReplicaSet **keeps N matching Pods**. Deployment **manages ReplicaSets** to provide **rolling updates** and **rollbacks**; you normally use Deployment, not standalone ReplicaSet.

**5. Can you run a database on a Deployment?**  
You *can* for experiments, but **production** needs **persistent identity, storage, and failover**—usually **StatefulSet + operator** or a **managed database**. Interviewers want that nuance.

**6. What happens when a new node joins a cluster that runs a DaemonSet?**  
The DaemonSet controller **schedules a new Pod** on that node (unless selectors/tolerations exclude it), so **coverage stays complete**.

**7. Name two real-world DaemonSet use cases.**  
Examples: **node log shipping**, **Prometheus node exporter**, **security monitoring agent**, or **CNI-related** node components.

---

*You now have a decision framework: **stateless scale** → Deployment; **named replicas + data** → StatefulSet; **every node** → DaemonSet. Next steps in learning: Services, probes, storage classes, and HPA metrics—tie them back to these three patterns.*
