let wrappedMethod = null;


export default (method) => {
  return function (...args) {
    if(wrappedMethod === null){
      wrappedMethod = this.__syncWrapper(method);
    }

    return wrappedMethod(...args);
  };
};