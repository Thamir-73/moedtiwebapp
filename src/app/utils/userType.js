export function getUserType() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userType');
    }
    return null;
  }
  
  export function setUserType(type) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userType', type);
    }
  }