let wrappedMethod = null;


export default () => (target, name, descriptor) => {
  if(descriptor.initializer){
    const originalInitializer = descriptor.initializer;
    descriptor.initializer = function (){
      const originalMethod = originalInitializer.apply(this);
      return this.__asyncWrapper(originalMethod);
    };
  }else{
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
      if(wrappedMethod === null){
        wrappedMethod = this.__asyncWrapper(originalMethod)
      }
      return wrappedMethod(...args);
    };
  }
};