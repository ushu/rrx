import * as React from "react"
import { Observable, combineLatest } from "rxjs"
import { map, startWith } from "rxjs/operators"
import componentFromStream from "./componentFromStream"

// Diff / Omit taken from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-redux/v5/index.d.ts
// which itself took it from https://github.com/Microsoft/TypeScript/issues/12215#issuecomment-311923766
type Omit<T, K extends keyof T> = Pick<
  T,
  ({ [P in keyof T]: P } &
    { [P in K]: never } & { [x: string]: never; [x: number]: never })[keyof T]
>

// the type returned by bindPropStreams: a function that takes a React component, and return the same components without
// the injected props
export interface Binder<InjectedProps extends object> {
  <P extends InjectedProps>(
    component: React.ComponentType<P>,
  ): React.ComponentType<Omit<P, keyof InjectedProps>>
}

export default function bindProps<Props extends object>(
  injectedProps$: Observable<Props>,
): Binder<Props> {
  return <P extends Props>(component: React.ComponentType<P>) =>
    componentFromStream<Omit<P, keyof Props>>(props$ =>
      combineLatest(props$, injectedProps$).pipe(
        // we take the input props, and merge them with the injected props
        map(
          ([props, injectedProps]) =>
            Object.assign({}, props, injectedProps) as P,
        ),
        // and then instanciate the component
        map(props => React.createElement(component, props)),
      ),
    )
}
