I want to add the concept of tenant.

I imagine this will complex becuase I want to enforce the idea that a tenant is a person, but so is a vendor.  So in the database and in the back end we will have the notion/entity of a person and a tenant.  Meaning there will be a person table and a tenant table.

And in the libs/domain we should have a person and a tenant entity.

We should have crud feature for tenant.

a person has

// name
firstName
lastName
middleName (not required and can be an initial)

// contact
email (required)
phone (required)

// notes (for holding zelle information, etc)

tenant

has a 1 to 1 relationship with a property, though I suppose it is not impossible for a tenant to have two properties.  Either way if I were to have a tenant detail view that view should show the property of the tenant. 

And like wise when I go to a property detail view that view has the tenant.

It is also useful to know if the tenant has pets.  That ties into rent.  

Lets start with the backend.

Lets have unit testing for all the crud endpoints.

Document the effort and place in the docs folder and in that documentation provide for me curl commands so that I can test each route.

After that we will work on the frontend.




Immediatley after this task we will then refactor the property feature so that we can assign a tenant to the property.