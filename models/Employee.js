const mongoose = require('mongoose');

//Create Schema
const EmployeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please Enter First Name"],
    trim: true,
    lowercase: true
  },
  lastname: {
    type: String,
    alias: 'surname', //Familyname
    required: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    minlength: 5,
    maxlength: 50,
    //Custom Validator for EMAIL
    validate: function(value){
      var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(value);
    }
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
    lowercase:true
  },
  city:{
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    default: 0.0,
    //min: [1000, 'Too less salary'],
    //max: 25000
    validate: function(value){
      if(value < 0){
        throw new Error("Negative Salary not allowed")
      }
    }
  },
  created: { 
    type: Date,
    default: Date.now,
    alias: 'createdat'
  },
  updatedat: { 
    type: Date,
    default: Date.now
  },
});

//Declare Virtual Fields
EmployeeSchema.virtual('fullname')
  .get(function() {
    return `${this.firstname} ${this.lastname}`
  })
  .set(function(value) {
    console.log(value)
  })

//Custom Schema Methods
//1. Instance Method Declaration
EmployeeSchema.methods.getFullName = function(){
  return `${this.firstname} ${this.lastname}`
}

EmployeeSchema.methods.getFormatedSalary = function(){
  return `$${this.salary}`
}

//2. Static method declararion
EmployeeSchema.static("getEmployeeByFirstName", function(value) {
  return this.find({firstname: value})
});


//Writing Query Helpers
EmployeeSchema.query.byLastName = function(value){
  return this.where({lastname: value})
}

EmployeeSchema.query.byFirstName = function(value, salary){
  return this.where({firstname: value})
             .where('salary').gte(salary)
}


//Pre Middleware
EmployeeSchema.pre('save', (next) => {
  console.log("Before Save")
  let now = Date.now()
   
  this.updatedat = now
  // Set a value for createdAt only if it is null
  if (!this.created) {
    this.created = now
  }
  
  // Call the next function in the pre-save chain
  next()
});

EmployeeSchema.pre('findOneAndUpdate', (next) => {
  console.log("Before findOneAndUpdate")
  let now = Date.now()
  this.updatedat = now
  console.log(this.updatedat)
  next()
});

//Post Middelware
EmployeeSchema.post('init', (doc) => {
  console.log('%s has been initialized from the db', doc._id);
});

EmployeeSchema.post('validate', (doc) => {
  console.log('%s has been validated (but not saved yet)', doc._id);
});

EmployeeSchema.post('save', (doc) => {
  console.log('%s has been saved', doc._id);
});

EmployeeSchema.post('remove', (doc) => {
  console.log('%s has been removed', doc._id);
});

//Create Model
const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
