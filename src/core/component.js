import React from 'react';

import iterate from '../utils/iterate';


const componentFactory = (isPure) =>
  class extends (isPure ? React.PureComponent : React.Component) {
    constructor(props){
      super(props);

      this.__componentDidMountMethodOverridenMethod = null;
      this.__componentWillUnmountOverridenMethod = null;

      this.__isMounted = false;
      this.__isUpdateRequested = false;

      this.__attachedStores = {};

      this.__key = Symbol();
    }

    __attachStores = (...stores) => {
      stores.forEach(store => {

        if(this.__isMounted){
          store.__connectComponent(this.__key, this.__requestUpdate);
        }

        this.__attachedStores[store.__key] = {
          instance: store,
          isConnected: this.__isMounted,
        }
      });

      if(stores.length > 0 && this.__isMounted) {
        this.__requestUpdate();
      }
    };

    __detachStores = (...stores) => {
      stores.forEach(store => {
        const storeToDetach = this.__attachedStores[store.__key] || null;

        if(storeToDetach.isConnected){
          storeToDetach.instance.__disconnectComponent(this.__key);
        }

        delete this.__attachedStores[store.__key];
      });

      if(this.__isMounted){
        this.__requestUpdate();
      }
    };

    __connectAllAttachedStores = () => {
      iterate(this.__attachedStores, store => {
        if(!store.isConnected){
          store.instance.__connectComponent(this.__key, this.__requestUpdate);
          store.isConnected = true;
        }
      });
    };

    __disconnectAllAttachedStores = () => {
      iterate(this.__attachedStores, store => {
        if(store.isConnected){
          store.instance.__disconnectComponent(this.__key);
          store.isConnected = false;
        }
      });
    };

    __realComponentDidMountMethod = (...args) => {
      this.__isMounted = true;
      this.__connectAllAttachedStores();
      if (typeof this.__componentDidMountMethodOverridenMethod === 'function') {
        return this.__componentDidMountMethodOverridenMethod(...args);
      }
    };

    set componentDidMount (method){
      this.__componentDidMountMethodOverridenMethod = method;
    }

    get componentDidMount (){
      return this.__realComponentDidMountMethod;
    }

    __realComponentWillUnmountMethod = (...args) => {
      this.__isMounted = false;
      this.__disconnectAllAttachedStores();
      if (typeof this.__componentWillUnmountOverridenMethod === 'function') {
        return this.__componentWillUnmountOverridenMethod(...args);
      }
    };

    set componentWillUnmount (method){
      this.__componentWillUnmountOverridenMethod = method;
    }

    get componentWillUnmount (){
      return this.__realComponentWillUnmountMethod;
    }

    set attach (method) {
      return new Error('This is a built-in method for dynamic attaching stores');
    }

    get attach () {
      return this.__attachStores;
    }

    set detach (method) {
      return new Error('This is a built-in method for dynamic detaching stores');
    }

    get detach () {
      return this.__detachStores;
    }

    __updateComponent = () => {
      this.__isUpdateRequested = false;

      if(this.__isMounted) {
        this.forceUpdate();
      }
    };

    __requestUpdate = () => {
      if(this.__isUpdateRequested){
        return;
      }

      requestAnimationFrame(this.__updateComponent);
      this.__isUpdateRequested = true;
    };
  };


export const Component = componentFactory(false);
export const PureComponent = componentFactory(true);
