# Property Management Domain Model

## Core Domain Concepts

Your system manages **maintenance activities and their associated costs** across a portfolio of rental properties. The core insight is that expenses stem from **maintenance work**, which can involve multiple people, vendors, material purchases, and travel time.

---

## Key Entities

### 1. Property
**What it is**: A single-family home you own and rent out.

```typescript
Property {
  id: UUID
  address: Address              // Full address (street, city, state, zip)
  units: Unit[]                 // One per single-family home (but structure allows for future multi-unit)
  createdAt: DateTime
  notes: string                 // Long-term notes about the property
}

Address {
  street: string
  city: string
  state: string
  zipCode: string
  coordinates?: {lat, lng}      // Optional: for route planning, clustering
}
```

**Why**: You need to know *where* the work happened. This anchors everything.

---

### 2. Tenant
**What it is**: A person renting one of your properties.

```typescript
Tenant {
  id: UUID
  propertyId: UUID              // Which property they rent
  name: string
  email?: string
  phone?: string
  leaseStartDate: Date
  leaseEndDate?: Date           // Optional: for past tenants
  notes: string                 // Special notes, requests, issues
}
```

**Why**: Track who's living at each property, contact info, lease dates. Useful for correlating maintenance issues to tenants (e.g., "tenant reported leak" or "before/after tenant turnover").

---

### 3. MaintenanceWork
**What it is**: A single unit of work that needs to be done. This is the core entity that ties everything together.

```typescript
MaintenanceWork {
  id: UUID
  propertyId: UUID              // Where the work is happening
  title: string                 // "Replace storm door closer", "Fix kitchen sink leak"
  description: string           // Detailed description
  workType: WorkType            // Enum: REPAIR, REPLACEMENT, MAINTENANCE, PREVENTIVE, etc.
  status: Status                // Enum: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  priority: Priority            // Enum: LOW, MEDIUM, HIGH, URGENT
  
  // Temporal
  dateScheduled?: Date
  dateStarted?: Date
  dateCompleted?: Date
  
  // Who did the work?
  workPerformedBy: WorkPerformer[]  // Can be you, wife, son, vendor, combination
  
  // Material & costs
  materialReceipts: Receipt[]    // All receipts for parts/supplies
  
  // Travel
  travelActivities: TravelActivity[]  // Mileage if you/family traveled
  
  // Financial summary (denormalized for quick lookup)
  totalMaterialCost: Money      // Sum of material receipts
  totalLaborCost: Money         // Sum of labor entries (if you bill yourself/family)
  totalCost: Money              // totalMaterialCost + totalLaborCost
  
  notes: string
  attachments?: File[]          // Photos before/after
}

enum WorkType {
  REPAIR,
  REPLACEMENT,
  MAINTENANCE,
  PREVENTIVE,
  INSPECTION,
  EMERGENCY
}

enum Status {
  PLANNED,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED
}

enum Priority {
  LOW,
  MEDIUM,
  HIGH,
  URGENT
}
```

**Why**: This is your operational record. Every maintenance action ties back to this. It's the single source of truth for "what work happened and what did it cost?"

---

### 4. WorkPerformer
**What it is**: A record of who did the work and how long they took.

```typescript
WorkPerformer {
  id: UUID
  maintenanceWorkId: UUID
  performerType: PerformerType  // Enum: OWNER, FAMILY, VENDOR
  
  // If OWNER or FAMILY
  personId?: UUID               // Reference to Person (you, your wife, your son)
  
  // If VENDOR
  vendorId?: UUID               // Reference to Vendor
  vendorInvoice?: string        // External invoice number
  
  // Time tracking
  hoursWorked: Decimal          // 0.5 = 30 mins, 4.0 = 4 hours
  hourlyRate?: Money            // Only if billing yourself or family for future analysis
  laborCost: Money              // hoursWorked * hourlyRate (or invoice amount from vendor)
  
  role: string                  // "Installer", "Electrician", "Owner", etc.
  notes: string                 // "Son did the plumbing, owner did hardware installation"
}

enum PerformerType {
  OWNER,
  FAMILY,
  VENDOR
}

type Person = Owner | FamilyMember

Owner {
  id: UUID
  name: string                  // You
  email: string
  phone?: string
}

FamilyMember {
  id: UUID
  name: string                  // Your wife, son, etc.
  relationship: string          // "Spouse", "Son", etc.
  email?: string
  phone?: string
}
```

**Why**: You need to know *who did the work*, *how long they spent*, and potentially *what it should cost* (even if you don't charge yourself). This enables future analysis like "how many hours did we spend on this property?" or "was it cheaper to DIY vs. hire a vendor?"

---

### 5. Vendor
**What it is**: A service provider you hire (HVAC company, painting contractor, plumber, etc.).

```typescript
Vendor {
  id: UUID
  name: string                  // "Smith HVAC", "Best Painting Co"
  vendorType: VendorType        // Enum: HVAC, PLUMBER, ELECTRICIAN, PAINTER, TREE_SERVICE, GENERAL, OTHER
  contactPerson?: string
  email?: string
  phone?: string
  address?: Address
  website?: string
  
  // Contract terms (useful for recurring services)
  serviceAreas?: string[]       // Which properties they service
  recurringServiceType?: string // "HVAC servicing twice yearly"
  
  notes: string
  isActive: boolean             // Track inactive vendors
  createdAt: DateTime
}

enum VendorType {
  HVAC,
  PLUMBER,
  ELECTRICIAN,
  PAINTER,
  TREE_SERVICE,
  GENERAL_CONTRACTOR,
  SUPPLY_STORE,
  OTHER
}
```

**Why**: Centralize vendor info so you can track "which HVAC company, their pricing, contact info" without duplicating it across multiple maintenance records.

---

### 6. Receipt
**What it is**: A material/supply purchase (from Home Depot, Lowes, online, etc.).

```typescript
Receipt {
  id: UUID
  maintenanceWorkId: UUID       // Which maintenance work this is for
  vendor?: VendorId             // If from a store (Home Depot, Lowes, etc.)
  store: StoreName              // Enum or string: "Home Depot", "Lowes", "Ace Hardware", "Amazon", etc.
  
  // Financial
  date: Date
  amount: Money
  description: string           // "Storm door closer, hinge pins, wood screws"
  items?: ReceiptLineItem[]     // Itemized (optional, for detail)
  
  // Document
  receiptNumber?: string
  receiptPhotoUrl?: string      // Photo of physical receipt
  
  // Tax (useful for tax deductions later)
  isTaxDeductible: boolean      // Likely yes for rentals
  category?: ExpenseCategory    // PARTS, TOOLS, SUPPLIES, EQUIPMENT, etc.
}

ReceiptLineItem {
  description: string
  quantity: Decimal
  unitPrice: Money
  lineTotal: Money
}

enum ExpenseCategory {
  PARTS,
  SUPPLIES,
  TOOLS,
  EQUIPMENT,
  LABOR,
  OTHER
}

enum StoreName {
  HOME_DEPOT,
  LOWES,
  ACE_HARDWARE,
  AMAZON,
  OTHER_VENDOR,
  OTHER
}
```

**Why**: Track every material expense. You'll need this for tax deductions, cost analysis, and to answer "how much did we spend on parts for the deck project?"

---

### 7. TravelActivity
**What it is**: A trip taken to a property (for inspection, material pickup, work, etc.).

```typescript
TravelActivity {
  id: UUID
  maintenanceWorkId: UUID       // What work this trip was for (or null if just inspection)
  
  // Route
  startLocation: Address        // Your home
  endLocation: Address          // The property
  date: Date
  
  // Distance
  milesDriven: Decimal          // Actual miles or estimated
  mileageRate: Money            // IRS rate for the year (currently $0.67/mile for 2024)
  mileageCost: Money            // milesDriven * mileageRate
  
  // Time
  hoursSpent?: Decimal          // Total time including drive time
  purpose: string               // "Pick up materials", "Install door closer", "Final inspection"
  
  notes: string
}
```

**Why**: Track mileage for tax deductions. The IRS allows deductions for business miles. For rental properties, maintenance trips count.

---

### 8. RecurringService
**What it is**: A service that happens regularly (HVAC twice yearly, etc.).

```typescript
RecurringService {
  id: UUID
  vendorId: UUID                // Which vendor
  propertyId: UUID              // Or propertyIds: UUID[] if it's across multiple
  
  serviceName: string           // "HVAC Spring Service", "HVAC Fall Service"
  serviceType: string           // PREVENTIVE_MAINTENANCE, INSPECTION, etc.
  
  // Schedule
  frequency: Frequency          // Enum: QUARTERLY, SEMI_ANNUALLY, ANNUALLY
  nextDueDate: Date
  lastCompletedDate?: Date
  
  // Cost
  estimatedCost: Money          // For budgeting
  actualCostLastService?: Money
  
  notes: string
}

enum Frequency {
  QUARTERLY,
  SEMI_ANNUALLY,
  ANNUALLY,
  CUSTOM
}
```

**Why**: You mentioned "HVAC company services 4 properties, twice a year." This captures that pattern so you can track "was the spring service done? When's the fall service due?"

---

## Data Relationships (ER View)

```
Property (1) ──── (M) MaintenanceWork
           │
           ├──(1)──(M) Tenant
           └──(1)──(M) RecurringService

MaintenanceWork (1) ──── (M) WorkPerformer
                │
                ├──(1)──(M) Receipt
                └──(1)──(M) TravelActivity

WorkPerformer (M) ── (1) Vendor
              └──(M)─── Person (Owner/FamilyMember)

Vendor (1) ──── (M) RecurringService
    │
    └────── (1)──(M) Receipt
```

---

## Use Case Examples

### 1. "I drove to Home Depot, bought a door closer, and installed it"

```
MaintenanceWork {
  propertyId: house_1
  title: "Replace storm door closer"
  workPerformedBy: [
    {
      personId: you,
      hoursWorked: 1.5,
      role: "Owner - Installation"
    }
  ],
  materialReceipts: [
    {
      store: HOME_DEPOT,
      amount: $42.50,
      description: "Storm door closer, hinge pins"
    }
  ],
  travelActivities: [
    {
      startLocation: your_home,
      endLocation: house_1,
      date: today,
      milesDriven: 5,
      mileageRate: $0.67/mile,
      mileageCost: $3.35,
      purpose: "Buy materials and install door closer"
    }
  ],
  totalMaterialCost: $42.50,
  totalLaborCost: $0 (you don't bill yourself),
  totalCost: $42.50 (+ $3.35 mileage for tax purposes)
}
```

### 2. "My son fixed a kitchen sink, bought parts from Home Depot, spent 4 hours"

```
MaintenanceWork {
  propertyId: house_2,
  title: "Fix kitchen sink leak",
  workPerformedBy: [
    {
      personId: son,
      hoursWorked: 4,
      role: "Family - Plumbing"
    }
  ],
  materialReceipts: [
    {
      store: HOME_DEPOT,
      amount: $68.99,
      description: "Sink trap, PVC fittings, washers"
    }
  ],
  travelActivities: [
    {
      startLocation: sons_home,
      endLocation: house_2,
      milesDriven: 12,
      mileageCost: $8.04,
      purpose: "Repair kitchen sink leak"
    }
  ],
  totalMaterialCost: $68.99,
  totalCost: $68.99 (+ $8.04 mileage)
}
```

### 3. "HVAC company services 4 properties, twice a year, single invoice"

```
// One vendor
Vendor {
  name: "Smith HVAC",
  vendorType: HVAC,
  phone: "555-1234",
  serviceAreas: [house_1, house_3, house_7, house_12]
}

// Two recurring services (spring and fall)
RecurringService {
  vendorId: smith_hvac,
  propertyId: null (or all 4 property IDs),
  serviceName: "HVAC Spring Maintenance",
  frequency: SEMI_ANNUALLY,
  estimatedCost: $200 (they charge $200/property twice yearly = $400/property/year)
}

// When service is completed, create maintenance work entries
MaintenanceWork (for house_1) {
  title: "HVAC Spring Service - Smith HVAC",
  workPerformedBy: [
    {
      vendorId: smith_hvac,
      laborCost: $200,
      vendorInvoice: "INV-2024-001"
    }
  ],
  totalCost: $200
}

MaintenanceWork (for house_3) {
  title: "HVAC Spring Service - Smith HVAC",
  workPerformedBy: [
    {
      vendorId: smith_hvac,
      laborCost: $200,
      vendorInvoice: "INV-2024-001"
    }
  ],
  totalCost: $200
}
// ... repeat for house_7 and house_12
```

### 4. "We painted a house ourselves one year, paid someone another year"

```
// Year 1: DIY
MaintenanceWork {
  propertyId: house_5,
  title: "Full exterior paint job",
  workPerformedBy: [
    {
      personId: you,
      hoursWorked: 20,
      role: "Owner - Exterior painting"
    },
    {
      personId: wife,
      hoursWorked: 16,
      role: "Spouse - Exterior painting"
    }
  ],
  materialReceipts: [
    {
      store: HOME_DEPOT,
      amount: $450,
      description: "Exterior paint (10 gallons), brushes, rollers, drop cloths"
    }
  ],
  totalMaterialCost: $450,
  totalCost: $450 (no labor cost to yourself)
}

// Year 2: Hire vendor
MaintenanceWork {
  propertyId: house_5,
  title: "Full exterior paint job - Professional",
  workPerformedBy: [
    {
      vendorId: best_painting_co,
      laborCost: $2800,
      vendorInvoice: "BP-2024-156"
    }
  ],
  totalCost: $2800
}
```

### 5. "Tree removal"

```
MaintenanceWork {
  propertyId: house_8,
  title: "Remove dead oak tree",
  workPerformedBy: [
    {
      vendorId: acme_tree_service,
      laborCost: $1200,
      vendorInvoice: "ATS-2024-089"
    }
  ],
  totalCost: $1200,
  notes: "Tree was dying, removed stump too"
}
```

---

## Summary: Why This Structure Works

| Concept | Why It Matters |
|---------|---|
| **MaintenanceWork** | Central record of every action; ties people, costs, and travel |
| **WorkPerformer** | Flexible: owner, family, or vendor; tracks hours and costs |
| **Receipt** | Every material purchase; needed for tax deductions and cost analysis |
| **TravelActivity** | Mileage tracking; IRS-deductible for rental property maintenance |
| **Vendor** | Reusable vendor info; HVAC company used across multiple properties |
| **RecurringService** | Captures "HVAC twice yearly" pattern; helps schedule and remind |
| **Property + Tenant** | Anchors everything; tells you WHERE the work happened and WHO lives there |

---

## Tax Implications (Notes for Later)

All of these expenses are likely **tax-deductible** for rental property owners:
- Material costs (receipts)
- Labor (if you hire vendors)
- Mileage (IRS allows standard deduction per mile)
- Tools and equipment

Your data structure captures everything needed to generate a **tax deduction report** like:
- "Total materials spent: $3,200"
- "Total mileage: 500 miles × $0.67 = $335"
- "Total hired labor: $4,500"
- **Total deduction-eligible expenses: $8,035**

---

## Next Steps for Schema Design

1. **Define the User model** (you and your wife as system users)
2. **Add role-based access** (read/write permissions per property)
3. **Add search and filtering** ("Show all expenses for House 1 in 2024")
4. **Add reporting** (annual expense summary, vendor spend analysis, property ROI)
5. **Add notifications** ("HVAC service due on property 3")
6. **Add photo attachments** (before/after photos of work)

---

## First Implementation Priorities

Start with:
1. Property + Address
2. MaintenanceWork + WorkPerformer
3. Receipt
4. TravelActivity

These four give you 80% of the value. Add:
5. Vendor + RecurringService
6. Tenant (lower priority, but useful for context)

Later:
7. Reporting and tax deduction calculations
8. Scheduling and reminders
