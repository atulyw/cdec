# Terraform Loops — Beginner Notes

> **Audience:** Absolute beginners · Students · Revision · GitHub docs · Classroom teaching  
> **Goal:** Learn how Terraform repeats work without copy-pasting code.

---

## Table of Contents

1. [Introduction to Loops](#1-introduction-to-loops)
2. [Why Loops Are Used in Terraform](#2-why-loops-are-used-in-terraform)
3. [count](#3-count)
4. [for_each](#4-for_each)
5. [for Expressions](#5-for-expressions)
6. [dynamic Blocks](#6-dynamic-blocks)
7. [Difference Between count and for_each](#7-difference-between-count-and-for_each)
8. [Best Practices](#8-best-practices)
9. [Common Mistakes](#9-common-mistakes)
10. [Interview Questions](#10-interview-questions)
11. [Practice Exercises](#11-practice-exercises)
12. [Mini Assignment](#12-mini-assignment)
13. [Summary Table](#summary-table)
14. [Cheat Sheet](#cheat-sheet)
15. [Key Points to Remember](#key-points-to-remember)
16. [Practice Tasks](#practice-tasks)
17. [Beginner Mini Project](#beginner-mini-project)

---

## 1. Introduction to Loops

### Simple Definition

A **loop** in Terraform lets you write **one block of code** and use it **many times**.

Instead of creating 5 IAM users by writing 5 separate blocks, you write **one block** and tell Terraform: *"Repeat this 5 times."*

### Real-World Analogy

Imagine printing **10 name tags** for a workshop.

- **Without a loop:** You type each name tag one by one.
- **With a loop:** You use one template and fill it for every name on a list.

### Why It Matters in Real Projects

In AWS, you often need:

- Many EC2 instances
- Many S3 buckets (dev, staging, prod)
- Many IAM users
- Many security group rules

Loops keep your Terraform code **short**, **clean**, and **easy to update**.

### The Four Loop Tools in Terraform

| Tool | What it does |
|------|----------------|
| `count` | Repeat by number or list length |
| `for_each` | Repeat by map or set (unique keys) |
| `for` expression | Transform lists/maps (does **not** create resources) |
| `dynamic` block | Repeat **nested blocks** inside one resource |

### Beginner Example

```hcl id="intro-loop"
variable "user_names" {
  default = ["alice", "bob", "charlie"]
}

resource "aws_iam_user" "users" {
  count = length(var.user_names)
  name  = var.user_names[count.index]
}
```

### Output Explanation

Terraform creates **3 IAM users**:

- `aws_iam_user.users[0]` → alice
- `aws_iam_user.users[1]` → bob
- `aws_iam_user.users[2]` → charlie

### Real-World Use Case

A startup hires 20 developers. You keep names in a list variable. One loop creates all IAM users.

### Common Mistakes

- Thinking loops are "advanced only" — they are normal in real Terraform.
- Forgetting that looped resources get an **index or key** in their address (e.g. `[0]`, `["alice"]`).

### Best Practice

Start with a **small list** (2–3 items). Run `terraform plan` before `apply`.

---

## 2. Why Loops Are Used in Terraform

### Simple Definition

Loops help you follow the main idea of **Infrastructure as Code (IaC)**:

> Write once → reuse many times → change in one place.

### Real-World Analogy

A pizza shop uses **one dough recipe** for every pizza. They don't rewrite the recipe for each order.

### Step-by-Step: Manual vs Loop

**Step 1 — Manual way (bad for scale):**

```hcl id="manual-ec2"
resource "aws_instance" "web1" { ami = "ami-123" instance_type = "t3.micro" }
resource "aws_instance" "web2" { ami = "ami-123" instance_type = "t3.micro" }
resource "aws_instance" "web3" { ami = "ami-123" instance_type = "t3.micro" }
```

**Step 2 — Loop way (good):**

```hcl id="loop-ec2"
variable "instance_count" {
  default = 3
}

resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = "ami-123"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server-${count.index + 1}"
  }
}
```

**Step 3 — Change scale easily:**

```hcl id="change-count"
# Change only this number
variable "instance_count" {
  default = 5
}
```

### Output Explanation

Changing `instance_count` from 3 to 5 makes Terraform plan **2 new instances** — no need to copy-paste code.

### Real-World Use Case

| Scenario | Why loops help |
|----------|----------------|
| 3 S3 buckets (dev/stage/prod) | One map → three buckets |
| 10 EC2 instances in an ASG-style setup | One `count` |
| 15 security group rules | One `dynamic` block |
| Team IAM users | One list → many users |

### Common Mistakes

- Hard-coding resource names in 20 places instead of using a variable + loop.
- Mixing manual resources and loop resources for the same thing.

### Best Practice

Put repeating data in **variables** or **locals**. Loop over that data.

---

## 3. count

### Simple Definition

`count` is a **number**. Terraform runs the resource block that many times.

Inside the block, use **`count.index`** — it starts at `0` and goes up: `0, 1, 2, 3...`

### Syntax

```hcl id="count-syntax"
resource "RESOURCE_TYPE" "NAME" {
  count = <number OR length(list)>

  # Inside the block:
  # count.index → 0, 1, 2, ...
}
```

**How to refer to a specific item:**

```hcl
aws_iam_user.users[0]   # first item
aws_iam_user.users[1]   # second item
```

### Visual: `count.index`

```
List: ["alice", "bob", "charlie"]

Index (count.index)   Value
─────────────────     ───────
        0          →  alice   →  aws_iam_user.users[0]
        1          →  bob     →  aws_iam_user.users[1]
        2          →  charlie →  aws_iam_user.users[2]
```

### Beginner Example — IAM Users

```hcl id="count-iam"
variable "developers" {
  type    = list(string)
  default = ["alice", "bob", "charlie"]
}

resource "aws_iam_user" "developers" {
  count = length(var.developers)
  name  = var.developers[count.index]

  tags = {
    Name = "dev-${var.developers[count.index]}"
  }
}

output "developer_arns" {
  value = aws_iam_user.developers[*].arn
}
```

### Output Explanation

| Output | Meaning |
|--------|---------|
| `aws_iam_user.developers[0]` | First user in state |
| `[*].arn` | All ARNs as a list |
| `count.index` | Position in the list (0-based) |

### Real-World Use Case — Multiple EC2 Instances

```hcl id="count-ec2"
variable "web_server_count" {
  default = 3
}

resource "aws_instance" "web" {
  count         = var.web_server_count
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-${count.index + 1}"
  }
}
```

### Real-World Use Case — Multiple S3 Buckets from a List

```hcl id="count-s3"
variable "bucket_names" {
  default = ["myapp-dev-logs", "myapp-stage-logs", "myapp-prod-logs"]
}

resource "aws_s3_bucket" "logs" {
  count  = length(var.bucket_names)
  bucket = var.bucket_names[count.index]
}
```

### Common Mistakes

| Mistake | Problem |
|---------|---------|
| Using `count = 0` to disable | References like `[0]` break |
| Removing middle list item | Indexes shift — Terraform may destroy/recreate wrong resources |
| Forgetting `length()` | `count` needs a number, not a raw list |

### Best Practice

Use `count` when order matters and items are a **simple list** with no unique key names.

---

## 4. for_each

### Simple Definition

`for_each` loops over a **map** or **set** (unique values).

Each item gives you:

- **`each.key`** — the name/key
- **`each.value`** — the value (for a set, same as key)

### Syntax

```hcl id="foreach-syntax"
resource "RESOURCE_TYPE" "NAME" {
  for_each = <map OR set>

  # each.key   → map key or set item
  # each.value → map value
}
```

**How to refer to a specific item:**

```hcl
aws_s3_bucket.buckets["dev"]
aws_iam_user.users["alice"]
```

### Visual: `each.key` and `each.value`

```
Map:
  key (each.key)    value (each.value)
  ─────────────     ─────────────────
  "dev"         →   "myapp-dev-bucket"    → aws_s3_bucket.buckets["dev"]
  "stage"       →   "myapp-stage-bucket"  → aws_s3_bucket.buckets["stage"]
  "prod"        →   "myapp-prod-bucket"   → aws_s3_bucket.buckets["prod"]
```

### Beginner Example — S3 Buckets by Environment

```hcl id="foreach-s3"
variable "buckets" {
  type = map(string)
  default = {
    dev   = "mycompany-dev-data"
    stage = "mycompany-stage-data"
    prod  = "mycompany-prod-data"
  }
}

resource "aws_s3_bucket" "env" {
  for_each = var.buckets
  bucket   = each.value

  tags = {
    Environment = each.key
    Name        = each.value
  }
}

output "bucket_arns" {
  value = { for k, b in aws_s3_bucket.env : k => b.arn }
}
```

### Output Explanation

State addresses look like:

```
aws_s3_bucket.env["dev"]
aws_s3_bucket.env["stage"]
aws_s3_bucket.env["prod"]
```

The output is a **map** keyed by environment name — easy to read.

### Real-World Use Case — IAM Users by Name

```hcl id="foreach-iam"
variable "team" {
  type = map(string)
  default = {
    alice   = "developer"
    bob     = "developer"
    carol   = "admin"
  }
}

resource "aws_iam_user" "team" {
  for_each = var.team
  name     = each.key

  tags = {
    Role = each.value
  }
}
```

### Real-World Use Case — EC2 Instances by Name

```hcl id="foreach-ec2"
variable "servers" {
  type = map(string)
  default = {
    api    = "t3.small"
    worker = "t3.medium"
    cache  = "t3.micro"
  }
}

resource "aws_instance" "app" {
  for_each      = var.servers
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = each.value

  tags = {
    Name = each.key
  }
}
```

### Converting a List to a Set

`for_each` does **not** accept a plain list. Use `toset()`:

```hcl id="foreach-toset"
variable "azs" {
  default = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
}

resource "aws_subnet" "public" {
  for_each          = toset(var.azs)
  availability_zone = each.key
  # each.key = "ap-south-1a", etc.
}
```

### Common Mistakes

| Mistake | Fix |
|---------|-----|
| Passing a list to `for_each` | Use `toset(list)` or convert to a map |
| Duplicate keys in a map | Keys must be unique |
| Using index after removing items | Prefer `for_each` with stable keys |

### Best Practice

Use `for_each` when each item has a **unique, stable name** (user name, env name, AZ name).

---

## 5. for Expressions

### Simple Definition

A `for` expression **transforms data**. It builds a new list or map.

It does **not** create AWS resources by itself.

### Real-World Analogy

You have a list of first names and create a list of email addresses. Same people — new format.

### Syntax

```hcl
# List → List
[ for <ITEM> in <LIST> : <RESULT> ]

# List → Map
{ for <ITEM> in <LIST> : <KEY> => <VALUE> }

# Map → Map (with filter)
{ for <KEY>, <VALUE> in <MAP> : <KEY> => <VALUE> if <CONDITION> }
```

### Beginner Example — Build a Map from a List

```hcl id="for-expr-list"
variable "user_names" {
  default = ["alice", "bob", "charlie"]
}

locals {
  user_tags = {
    for name in var.user_names :
    name => "team-member"
  }
}

# Result:
# {
#   "alice"   = "team-member"
#   "bob"     = "team-member"
#   "charlie" = "team-member"
# }
```

### Beginner Example — Filter a Map

```hcl id="for-expr-filter"
variable "instances" {
  type = map(string)
  default = {
    api    = "t3.small"
    worker = "t3.medium"
    test   = "t3.micro"
  }
}

locals {
  production_only = {
    for name, size in var.instances :
    name => size
    if size != "t3.micro"
  }
}
```

### Output Explanation

| Input | `for` result |
|-------|----------------|
| List of names | Map of name → tag |
| Map of instances | Smaller map (filtered) |

Use the result in `for_each` on a resource block.

### Real-World Use Case — Prepare Data Before a Loop

```hcl id="for-expr-prep"
variable "environments" {
  default = ["dev", "stage", "prod"]
}

locals {
  bucket_map = {
    for env in var.environments :
    env => "myapp-${env}-storage-${data.aws_caller_identity.current.account_id}"
  }
}

resource "aws_s3_bucket" "storage" {
  for_each = local.bucket_map
  bucket   = each.value
}
```

### Common Mistakes

- Expecting `for` to create resources (only `resource` blocks do that).
- Writing complex logic inside `resource` blocks instead of `locals`.

### Best Practice

Use `for` in **`locals`** to prepare clean maps and lists. Keep resource blocks simple.

---

## 6. dynamic Blocks

### Simple Definition

Some resources have **nested blocks** inside them (like `ingress` in a security group).

`dynamic` repeats those inner blocks from a list or map.

### Real-World Analogy

One form (security group) with many rule lines filled from a checklist.

### Syntax

```hcl id="dynamic-syntax"
resource "RESOURCE_TYPE" "NAME" {
  dynamic "<BLOCK_NAME>" {
    for_each = <list OR map>
    content {
      # use dynamic.<BLOCK_NAME>.value
    }
  }
}
```

### Beginner Example — Security Group Rules

```hcl id="dynamic-sg"
variable "ingress_rules" {
  default = [
    { port = 22,  cidr = "10.0.0.0/16", desc = "SSH from VPC" },
    { port = 80,  cidr = "0.0.0.0/0",   desc = "HTTP public" },
    { port = 443, cidr = "0.0.0.0/0",   desc = "HTTPS public" },
  ]
}

resource "aws_security_group" "web" {
  name   = "web-sg"
  vpc_id = aws_vpc.main.id

  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      description = ingress.value.desc
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = "tcp"
      cidr_blocks = [ingress.value.cidr]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### Output Explanation

Terraform shows **one** `aws_security_group.web` resource in the plan, with **3 ingress rules** inside it.

### Real-World Use Case — Rules from a Map

```hcl id="dynamic-sg-map"
locals {
  app_rules = {
    ssh   = { port = 22,  cidr = "10.0.0.0/16" }
    http  = { port = 80,  cidr = "0.0.0.0/0" }
    https = { port = 443, cidr = "0.0.0.0/0" }
  }
}

resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = aws_vpc.main.id

  dynamic "ingress" {
    for_each = local.app_rules
    content {
      description = ingress.key
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = "tcp"
      cidr_blocks = [ingress.value.cidr]
    }
  }
}
```

### Common Mistakes

- Using `dynamic` when separate `aws_security_group_rule` resources are clearer.
- Wrong iterator name: inside `content`, use `ingress.value` for `dynamic "ingress"`.

### Best Practice

Use `dynamic` for **simple, repeated nested blocks** inside one resource.

---

## 7. Difference Between count and for_each

### Simple Definition

Both repeat resources. They differ in **how items are identified**.

| Feature | `count` | `for_each` |
|---------|---------|------------|
| Input | Number or `length(list)` | Map or set |
| Identity | `count.index` (0, 1, 2…) | `each.key` / `each.value` |
| Address | `resource.name[0]` | `resource.name["key"]` |
| Remove middle item | Indexes shift — risky | Keys stay stable — safer |
| Best for | Ordered lists | Named items |

### Real-World Analogy

- **`count`** = numbered tickets. Remove ticket #2 → everyone after shifts down.
- **`for_each`** = named lockers. Remove "Alice's locker" → others unchanged.

### Side-by-Side Example

```hcl id="count-vs-foreach"
# ─── count ───
resource "aws_iam_user" "by_count" {
  count = 3
  name  = "user-${count.index}"
}
# Addresses: [0], [1], [2]

# ─── for_each ───
resource "aws_iam_user" "by_for_each" {
  for_each = toset(["alice", "bob", "charlie"])
  name     = each.key
}
# Addresses: ["alice"], ["bob"], ["charlie"]
```

### Output Explanation

```hcl
# count → list output
output "count_users" {
  value = aws_iam_user.by_count[*].name
}

# for_each → map output
output "foreach_users" {
  value = { for k, u in aws_iam_user.by_for_each : k => u.name }
}
```

### Real-World Use Case

| Use case | Better choice | Why |
|----------|---------------|-----|
| 5 identical EC2 instances | `count` | Order does not need a name |
| dev/stage/prod S3 buckets | `for_each` | Stable env names |
| IAM users by username | `for_each` | Name is the natural key |
| Temporary test instances | `count` | Simple number is enough |

### Common Mistakes

- Using `count` with a list, then removing the middle item — wrong resource may be destroyed.
- Using `for_each` with a list without `toset()`.

### Best Practice

**Prefer `for_each`** when items have meaningful, stable names.

---

## 8. Best Practices

### Simple Definition

Good loop habits make Terraform **safe**, **readable**, and **easy to change**.

### Step-by-Step Pattern

**Step 1 — Store data in variables**

```hcl id="bp-variables"
variable "developers" {
  type = list(string)
}
```

**Step 2 — Transform in locals (if needed)**

```hcl id="bp-locals"
locals {
  user_map = { for name in var.developers : name => "developer" }
}
```

**Step 3 — Loop in resources**

```hcl id="bp-resource"
resource "aws_iam_user" "dev" {
  for_each = local.user_map
  name     = each.key
}
```

**Step 4 — Output clearly**

```hcl id="bp-output"
output "user_names" {
  value = keys(aws_iam_user.dev)
}
```

### Real-World Use Case Checklist

- Use **variables** for lists and maps
- Use **`for` expressions** in `locals` to prepare data
- Use **`for_each`** for named resources
- Use **`count`** for simple numbered copies
- Use **`dynamic`** for nested blocks
- Always run **`terraform plan`** before `apply`
- Add **tags** with `each.key` or `count.index` for AWS Console clarity

### Common Mistakes

- Putting 50 lines of logic inside one resource block.
- No tags — hard to find resources in AWS Console.

### Best Practice

> **Prepare data in `locals` → loop in `resource` → expose in `output`.**

---

## 9. Common Mistakes

### Mistake 1 — List passed directly to `for_each`

```hcl
# Wrong
for_each = var.user_list

# Right
for_each = toset(var.user_list)
# OR use a map
```

### Mistake 2 — Hard-coded index references

```hcl
# Fragile
subnet_id = aws_subnet.public[0].id

# Better
subnet_id = aws_subnet.public["ap-south-1a"].id
```

### Mistake 3 — Mixing count and for_each on similar resources

Pick **one** style per resource type.

### Mistake 4 — Thinking `for` creates infrastructure

Only `resource` blocks (with `count` or `for_each`) create AWS resources.

### Mistake 5 — Not running plan after changing list order

With `count`, order changes can destroy and recreate resources.

### Mistake 6 — `count = 0` with existing references

Any `resource.name[0]` reference breaks when count is 0.

### Best Practice

After every variable change, run:

```bash
terraform plan
```

Read the plan carefully before applying.

---

## 10. Interview Questions

### Basic

1. What is a loop in Terraform?
2. Name the four loop-related features in Terraform.
3. What is `count.index`?
4. What are `each.key` and `each.value`?
5. Can `for_each` use a plain list?

### Intermediate

6. What is the difference between `count` and `for_each`?
7. Does a `for` expression create AWS resources?
8. When would you use `dynamic "ingress"`?
9. How do you output all IDs from a `for_each` resource?
10. What happens if you remove the middle item from a `count`-based list?

### Scenario-Based

11. You need 3 S3 buckets named dev, stage, prod. Which loop do you use?
12. You need 10 identical EC2 instances. Which loop do you use?
13. You have 8 security group ingress rules. Which feature helps most?
14. How do you disable a counted resource without breaking references?
15. Why is `for_each` safer when removing one item from infrastructure?

### Sample Answers (Short)

| Question | Short answer |
|----------|----------------|
| `count.index` | 0-based position in a counted list |
| `each.key` | Map key or set item name |
| `each.value` | Map value |
| `for` expression | Transforms data; no resources |
| `dynamic` | Repeats nested blocks inside one resource |

---

## 11. Practice Exercises

### Exercise 1 — IAM Users with `count`

Create 4 IAM users from a list. Output all user names.

### Exercise 2 — S3 Buckets with `for_each`

Create buckets for `dev`, `stage`, and `prod` using a map.

### Exercise 3 — `for` Expression

Convert a list `["web-1", "web-2", "web-3"]` into a map where each key maps to `"t3.micro"`.

### Exercise 4 — Security Group with `dynamic`

Create one security group with rules for ports 22, 80, and 443.

### Exercise 5 — EC2 with `count`

Create 3 EC2 instances tagged `app-server-1`, `app-server-2`, `app-server-3`.

### Exercise 6 — Compare Plans

Build the same 3 IAM users with `count` and then with `for_each`. Compare state addresses.

---

## 12. Mini Assignment

### Task

Create **3 IAM users** and **3 S3 buckets** using loops only (no manual copy-paste).

### Requirements

- Users: `alice`, `bob`, `charlie` — use `for_each`
- Buckets: `myapp-dev`, `myapp-stage`, `myapp-prod` — use a map + `for_each`
- Output user ARNs as a map
- Output bucket names as a list

### Starter Code

```hcl id="mini-assignment"
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

# ── IAM Users ──
variable "users" {
  default = ["alice", "bob", "charlie"]
}

resource "aws_iam_user" "team" {
  for_each = toset(var.users)
  name     = each.key
}

# ── S3 Buckets ──
variable "buckets" {
  type = map(string)
  default = {
    dev   = "myapp-dev-unique-suffix"
    stage = "myapp-stage-unique-suffix"
    prod  = "myapp-prod-unique-suffix"
  }
}

resource "aws_s3_bucket" "env" {
  for_each = var.buckets
  bucket   = each.value
}

# ── Outputs ──
output "user_arns" {
  value = { for name, user in aws_iam_user.team : name => user.arn }
}

output "bucket_names" {
  value = [for b in aws_s3_bucket.env : b.bucket]
}
```

### What to Check After Apply

```bash
terraform plan
terraform apply
terraform state list
```

You should see addresses like:

```
aws_iam_user.team["alice"]
aws_s3_bucket.env["dev"]
```

---

## Summary Table

| Concept | Creates resources? | Input type | Key identifier | AWS example |
|---------|-------------------|------------|----------------|-------------|
| `count` | Yes | Number / list length | `count.index` | N EC2 instances |
| `for_each` | Yes | Map / set | `each.key`, `each.value` | S3 per environment |
| `for` expression | No | List / map | N/A (data only) | Build bucket map |
| `dynamic` | No (nested only) | List / map | `dynamic.*.value` | SG ingress rules |

---

## Cheat Sheet

```hcl
# count
count = 3
count = length(var.list)
name  = var.list[count.index]
ref   = aws_instance.web[0]
out   = aws_instance.web[*].id

# for_each
for_each = var.my_map
for_each = toset(var.my_list)
name     = each.key
value    = each.value
ref      = aws_s3_bucket.b["dev"]
out      = { for k, v in aws_s3_bucket.b : k => v.id }

# for expression
[ for x in var.list : x ]
{ for k, v in var.map : k => v }
{ for x in var.list : x => x if x != "skip" }

# dynamic
dynamic "ingress" {
  for_each = var.rules
  content {
    from_port = ingress.value.port
  }
}
```

---

## Key Points to Remember

1. Loops stop you from copy-pasting Terraform code.
2. `count` uses **numbers** and `count.index` (starts at 0).
3. `for_each` uses **maps/sets** and `each.key` / `each.value`.
4. `for` expressions **transform data** — they do not create resources.
5. `dynamic` repeats **nested blocks** inside one resource.
6. Prefer `for_each` when items have **stable names**.
7. Always run `terraform plan` after changing lists or maps.
8. Put repeating data in **variables** and **locals**.
9. Use clear **outputs** so other modules can use your resources.
10. Read state addresses: `[0]` vs `["dev"]` tells you which loop was used.

---

## Practice Tasks

| # | Task | Skill |
|---|------|-------|
| 1 | 5 IAM users from a list using `count` | `count` |
| 2 | 3 S3 buckets from a map using `for_each` | `for_each` |
| 3 | Filter a map with a `for` expression | `for` |
| 4 | Security group with 4 ingress rules via `dynamic` | `dynamic` |
| 5 | 2 EC2 instances with `count` and tagged names | `count` + tags |
| 6 | Convert a `count` module to `for_each` and compare `plan` | Migration |
| 7 | Output a map of bucket name → ARN | Output + `for` |
| 8 | Use `toset()` to loop over AZ names | `for_each` + set |

---

## Beginner Mini Project

### Project: Team Infrastructure with Loops

Build a small AWS setup for a 3-person team using only loops.

### What You Will Create

| Resource | Loop type | Count |
|----------|-----------|-------|
| IAM users | `for_each` | 3 |
| S3 buckets (personal backups) | `for_each` | 3 |
| EC2 instances (dev servers) | `count` | 2 |
| Security group with rules | `dynamic` | 1 SG, many rules |

### Project Structure

```
terraform-loops-lab/
├── main.tf
├── variables.tf
├── outputs.tf
└── terraform.tfvars
```

### variables.tf

```hcl id="project-variables"
variable "team_members" {
  description = "List of team member usernames"
  type        = list(string)
  default     = ["alice", "bob", "charlie"]
}

variable "environments" {
  description = "Map of environment to bucket suffix"
  type        = map(string)
  default = {
    dev   = "dev-backup"
    stage = "stage-backup"
    prod  = "prod-backup"
  }
}

variable "dev_instance_count" {
  description = "Number of dev EC2 instances"
  type        = number
  default     = 2
}

variable "sg_rules" {
  description = "Ingress rules for the app security group"
  type = list(object({
    port = number
    cidr = string
    desc = string
  }))
  default = [
    { port = 22,  cidr = "10.0.0.0/16", desc = "SSH from VPC" },
    { port = 80,  cidr = "0.0.0.0/0",   desc = "HTTP" },
    { port = 443, cidr = "0.0.0.0/0",   desc = "HTTPS" },
  ]
}
```

### main.tf

```hcl id="project-main"
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

data "aws_caller_identity" "current" {}

# ── Prepare bucket names with for expression ──
locals {
  account_id = data.aws_caller_identity.current.account_id

  backup_buckets = {
    for env, suffix in var.environments :
    env => "team-${suffix}-${local.account_id}"
  }
}

# ── IAM Users (for_each) ──
resource "aws_iam_user" "member" {
  for_each = toset(var.team_members)
  name     = each.key

  tags = {
    Team = "engineering"
    Name = each.key
  }
}

# ── S3 Buckets (for_each) ──
resource "aws_s3_bucket" "backup" {
  for_each = local.backup_buckets
  bucket   = each.value

  tags = {
    Environment = each.key
    Name        = each.value
  }
}

# ── EC2 Instances (count) ──
resource "aws_instance" "dev" {
  count         = var.dev_instance_count
  ami           = "ami-0c55b159cbfafe1f0" # replace with valid AMI for your region
  instance_type = "t3.micro"

  tags = {
    Name = "dev-server-${count.index + 1}"
    Role = "development"
  }
}

# ── Security Group with dynamic ingress ──
resource "aws_security_group" "app" {
  name        = "team-app-sg"
  description = "App security group with dynamic rules"
  vpc_id      = aws_vpc.lab.id

  dynamic "ingress" {
    for_each = var.sg_rules
    content {
      description = ingress.value.desc
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = "tcp"
      cidr_blocks = [ingress.value.cidr]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Minimal VPC for the security group (single resource, no loop)
resource "aws_vpc" "lab" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "loops-lab-vpc"
  }
}
```

### outputs.tf

```hcl id="project-outputs"
output "iam_user_arns" {
  description = "Map of username to IAM ARN"
  value       = { for name, user in aws_iam_user.member : name => user.arn }
}

output "s3_bucket_names" {
  description = "List of backup bucket names"
  value       = [for b in aws_s3_bucket.backup : b.bucket]
}

output "ec2_instance_ids" {
  description = "List of dev EC2 instance IDs"
  value       = aws_instance.dev[*].id
}

output "security_group_id" {
  description = "App security group ID"
  value       = aws_security_group.app.id
}
```

### How to Run

```bash
cd terraform-loops-lab
terraform init
terraform plan
terraform apply
```

### Success Criteria

- [ ] 3 IAM users in state with `["alice"]` style addresses
- [ ] 3 S3 buckets keyed by environment name
- [ ] 2 EC2 instances with `[0]` and `[1]` addresses
- [ ] 1 security group with multiple ingress rules
- [ ] All outputs print correctly

---

## Quick Revision Flow

```
Variables / Locals
       ↓
  for expression (optional — transform data)
       ↓
  resource + count OR for_each
       ↓
  dynamic (optional — nested blocks)
       ↓
  output
       ↓
  terraform plan → apply
```

---

*Last updated: May 2026 · Terraform AWS Provider ~> 5.0*
