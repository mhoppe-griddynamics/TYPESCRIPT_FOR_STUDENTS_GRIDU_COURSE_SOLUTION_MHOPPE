// INTERFACE
interface ObserverInt {
    handlers: ObserverHandlersType,
    isUnsubscribed: boolean
    unsubscribe: () => void;
}

interface ObservableInt {
    subscribe: (obs: ObserverHandlersType) => {unsubscribe(): void};
}

/// TYPE
type handleType = (value: any) => { status: number};
type SubscribeType = (obs: ObserverHandlersType) => () => void;
type ObserverHandlersType = {
    next: handleType
    error: handleType
    complete: () => void
};
type UserType = {
    name: string,
    age: number,
    roles: string[],
    createdAt: Date,
    isDeleated: boolean
}

type requestsMockType  = {
    method: string
    host: string,
    path: string,
    params: {
        id?: string
    },
    body?: UserType,
};

/// CLASS OBSERVER
class Observer implements ObserverInt {
    public handlers: ObserverHandlersType;
    public isUnsubscribed: boolean;
    public _unsubscribe?: () => void;


    constructor(handlers: ObserverHandlersType) {
        this.handlers = handlers;
        this.isUnsubscribed = false;
    }

    next(value: handleType) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }

    error(error: handleType) {
        if (!this.isUnsubscribed) {
            if (this.handlers.error) {
                this.handlers.error(error);
            }
            this.unsubscribe();
        }
    }

    complete() {
        if (!this.isUnsubscribed) {
            if (this.handlers.complete) {
                this.handlers.complete();
            }
            this.unsubscribe();
        }
    }

    unsubscribe() {
        this.isUnsubscribed = true;
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}

// CLASS OBSERVABLE
class Observable implements ObservableInt {
    _subscribe: SubscribeType
    
    constructor(subscribe: SubscribeType) {
        this._subscribe = subscribe;
    }

    static from(values: requestsMockType []) {
        return new Observable((observer) => {
            values.forEach((value) => observer.next(value));

            observer.complete();

            return () => {
                console.log('unsubscribed');
            };
        });
    }

    subscribe(obs: ObserverHandlersType) {
        const observer = new Observer(obs);
        observer._unsubscribe = this._subscribe(obs);
        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }
}
const HTTP_POST_METHOD = 'POST';
const HTTP_GET_METHOD = 'GET';
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

//// USER MOCK
const userMock: UserType = {
    name: 'User Name',
    age: 26,
    roles: [
        'user',
        'admin'
    ],
    createdAt: new Date(),
    isDeleated: false,
};

/// REQUESTS MOCK
const requestsMock: requestsMockType [] = [
    {
        method: HTTP_POST_METHOD,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HTTP_GET_METHOD,
        host: 'service.example',
        path: 'user',
        params: {
            id: '3f5h67s4s'
        },
    }
];

///HANDLER-FUNCTIONS
const handleRequest: handleType = (_request) => {
    // handling of request
    return {status: HTTP_STATUS_OK};
};
const handleError: handleType = (_error) => {
    // handling of error
    return {status: HTTP_STATUS_INTERNAL_SERVER_ERROR};
};
const handleComplete: () => void = () => console.log('complete');

//MAKING REQUEST
const requests$: Observable = Observable.from(requestsMock);
const subscription: {unsubscribe(): void} = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});

//CALLING
subscription.unsubscribe();