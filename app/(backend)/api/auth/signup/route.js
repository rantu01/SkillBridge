const validateUniversityEmail = (email) => {
  // Regex to check if it ends with .edu or your specific university domain
  const universityDomain = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/; 
  return universityDomain.test(email);
};