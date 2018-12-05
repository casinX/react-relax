import iterate from '../utils/iterate';


export default class {
  constructor(){
    this.__key = Symbol();

    this.__connectedComponents = {};
  }

  __syncWrapper = (method) => {
    const self = this;
    return (...args) => {
      const result = method.apply(self, args);
      self.__updateAllConnectedComponents();
      return result;
    };
  };

  __asyncWrapper = (method) => {
    const self = this;

    const methodRefContainer = { ref: null, };

    const wrappedAsyncMethod = async (...args) => {
      const promise = method.apply(self, args);

      methodRefContainer.ref.isWaiting = true;
      methodRefContainer.ref.isReady = false;
      self.__updateAllConnectedComponents();

      await promise;

      methodRefContainer.ref.isWaiting = false;
      methodRefContainer.ref.isReady = true;
      self.__updateAllConnectedComponents();
      return promise;
    };

    methodRefContainer.ref = wrappedAsyncMethod;

    wrappedAsyncMethod.isWaiting = false;
    wrappedAsyncMethod.isReady = false;

    return wrappedAsyncMethod;
  };

  __connectComponent = (componentKey, updateMethod) => {
    this.__connectedComponents[componentKey] = updateMethod;
  };

  __disconnectComponent = (componentKey) => {
    delete this.__connectedComponents[componentKey];
  };

  __updateAllConnectedComponents = () => {
    iterate(this.__connectedComponents, updateMethod => updateMethod());
  };
}