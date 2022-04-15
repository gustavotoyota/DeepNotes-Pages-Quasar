/* eslint-disable @typescript-eslint/ban-ts-comment */

import { createDeferrer } from './defer';
import { capitalize } from './string';

export type Factory<Dependency> = (...args: any) => Dependency;
export type FactoryDependency<F extends Factory<any>> = ReturnType<F>;

export type Registration<F extends Factory<any>> = (factory?: any) => F;
export type RegistrationFactory<Reg> = Reg extends Registration<infer F>
  ? F
  : never;
export type RegistrationDependency<Reg extends Registration<any>> =
  FactoryDependency<RegistrationFactory<Reg>>;

export type Registrations = Record<string, Registration<any>>;
export type Factories<Regs extends Registrations> = {
  [Key in keyof Regs & string as `make${Capitalize<Key>}`]: RegistrationFactory<
    Regs[Key]
  >;
};
export type Dependencies<Regs extends Registrations> = {
  [Key in keyof Regs]: RegistrationDependency<Regs[Key]>;
};

export class Container<Regs extends Registrations> {
  readonly registrations: Regs;
  readonly factory: Factories<Regs>;
  readonly dependencies: Dependencies<Regs> = null as any;

  constructor(registrations: Regs) {
    this.registrations = registrations;
    this.factory = {} as Factories<Regs>;

    const deferrer = createDeferrer();

    for (const key of Object.keys(registrations)) {
      // @ts-ignore
      this.factory[`make${capitalize(key)}`] = (...args: any) => {
        if (key in deferrer) return deferrer[key];

        const deferred = deferrer[key];

        const result = registrations[key](this.factory)(...args);

        deferred.value = result;

        delete deferrer[key];

        return result;
      };
    }
  }
}