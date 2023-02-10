// 用于创建字符串列表映射至 K:V`的函数
function strEnum<T extends readonly any[]>(
  o: T
): {
  [K in keyof T as K extends `${number}`
    ? `${T[K] & string}_${K & string}`
    : never]: T[K];
} {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}
// 创建K:V
const Direction = strEnum(["North", "South", "East", "West"] as const);
// 创建一个类型
type Direction = keyof typeof Direction;

// interface IProps {
//   readonly a: string;
// }

// const b: IProps = { a: "1" };
// b.a = 2;

// interface IProps {
//   a: string;
// }

// const b: Readonly<IProps> = { a: "1" };
// b.a = 2;

interface IArray {
  readonly [x: number]: unknown;
}
const arr: IArray = { 0: 1, 1: "2" };

// declare function foo<T>(arg: T): void; // 单一参数没有必要使用泛型
// declare function foo(arg: any): void;

function foo(x: string | number): boolean {
  if (typeof x === "string") {
    return true;
  } else if (typeof x === "number") {
    return false;
  }

  // 如果不是一个 never 类型，这会报错：
  // - 不是所有条件都有返回值 （严格模式下）
  // - 或者检查到无法访问的代码
  // 但是由于 TypeScript 理解 `fail` 函数返回为 `never` 类型
  // 它可以让你调用它，因为你可能会在运行时用它来做安全或者详细的检查。
  return fail("Unexhaustive");
}

function fail(message: string): never {
  throw new Error(message);
}

// Error
// interface Bar {
//   [key: string]: number;
//   x: number;
//   y: string; // Error: y 属性必须为 number 类型
// }

// interface NestedCSS {
//   color?: string; // strictNullChecks=false 时索引签名可为 undefined
//   [selector: string]: string | NestedCSS;
// }

// const failsSilently: NestedCSS = {
//   colour: 'red' // 'colour' 不会被捕捉到错误
// };

interface NestedCSS {
  color?: string;
  nest?: {
    [selector: string]: NestedCSS;
  };
}

type FieldState = {
  value: string;
};

// type FromState = {
//   isValid: boolean; // Error: 不符合索引签名
//   [filedName: string]: FieldState;
// };

type FormState = { isValid: boolean } & { [fieldName: string]: FieldState };

// class Foo {}

// const Bar = Foo;

// let bar: Bar; // Error: 不能找到名称 'Bar'

// namespace importing {
//   export class Foo {}
// }

// import Bar = importing.Foo;
// let bar: Bar; // ok

// let foo1 = 123;
// let bar: typeof foo1; // 'bar' 类型与 'foo' 类型相同（在这里是： 'number'）

// bar = 456; // ok
// bar = '789'; // Error: 'string' 不能分配给 'number' 类型

const colors = {
  red: "red",
  blue: "blue",
};

type Colors = keyof typeof colors;

// class User extends Tagged, Timestamped { // ERROR : 不能多重继承
//   // ..
// }

// 所有 mixins 都需要
type Constructor<T = {}> = new (...args: any[]) => T;

/////////////
// mixins 例子
////////////

// 添加属性的混合例子
function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    timestamp = Date.now();
  };
}

// 添加属性和方法的混合例子
function Activatable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    isActivated = false;

    activate() {
      this.isActivated = true;
    }

    deactivate() {
      this.isActivated = false;
    }
  };
}

///////////
// 组合类
///////////

// 简单的类
class User {
  name = "";
}

// 添加 Timestamped 的 User
const TimestampedUser = Timestamped(User);

// Tina Timestamped 和 Activatable 的类
const TimestampedActivatableUser = Timestamped(Activatable(User));

//////////
// 使用组合类
//////////

const timestampedUserExample = new TimestampedUser();
console.log(timestampedUserExample.timestamp);

const timestampedActivatableUserExample = new TimestampedActivatableUser();
console.log(timestampedActivatableUserExample.timestamp);
console.log(timestampedActivatableUserExample.isActivated);

// 类型体操
type FirstType<T extends unknown[]> = T extends [infer a, ...unknown[]]
  ? a
  : never;

type first = FirstType<[1, 2]>;

type LastType<T extends unknown[]> = T extends [...unknown[], infer b]
  ? b
  : never;

type last = LastType<[1, 2]>;

type PopArr<T extends unknown[]> = T extends [...infer a, unknown] ? a : never;

type headArr = PopArr<[1, 2, 3]>;

type ShiftArr<T extends unknown[]> = T extends [unknown, ...infer b]
  ? b
  : never;

type footArr = ShiftArr<[1, 2, 3]>;

type StartWith<T extends string, K extends string> = T extends `${K}${string}`
  ? true
  : false;

type hasPrefix = StartWith<"prefix_test", "prefix">;

type ReplaceStr<
  str extends string,
  currentStr extends string,
  replaceStr extends string
> = str extends `${infer prefix}${currentStr}${infer suffix}`
  ? `${prefix}${replaceStr}${suffix}`
  : str;

type replaceStr1 = ReplaceStr<"helloworld", "world", "ts">;
type replaceStr2 = ReplaceStr<"helloworld", "ts", "world">;

type TrimLeft<str extends string> = str extends `${infer rest}${
  | " "
  | "\n"
  | "\t"}`
  ? TrimLeft<rest>
  : str;

type noLeftSpaceStr = TrimLeft<"test    ">;

type TrimRight<str extends string> = str extends `${
  | " "
  | "\n"
  | "\t"}${infer rest}`
  ? TrimRight<rest>
  : str;

type noRightSpaceStr = TrimRight<"    test">;

type TrimStr<str extends string> = TrimLeft<TrimRight<str>>;

type noSpaceStr = TrimStr<"    test    ">;

type getFuncParams<fun extends Function> = fun extends (
  ...params: infer params
) => unknown
  ? params
  : never;

const func = (info: string, msg: string) => {
  return `${info}: ${msg}`;
};

type params = getFuncParams<typeof func>;

type getFuncReturn<fun extends Function> = fun extends (
  ...params: unknown[]
) => infer res
  ? res
  : never;

type result = getFuncReturn<typeof func>;

type getConstructorParams<T extends new (...args: any[]) => any> =
  T extends new (...args: infer args) => unknown ? args : never;

interface ITestProps {
  new (name: string): string;
}

type params1 = getConstructorParams<ITestProps>;

type getConstructorRes<T extends new (...args: any[]) => any> = T extends new (
  ...args: any
) => infer res
  ? res
  : never;

type res = getConstructorRes<ITestProps>;

type CapitalizeStr<str extends string> =
  str extends `${infer first}${infer rest}`
    ? `${Uppercase<first>}${rest}`
    : never;

type upperStr = CapitalizeStr<"chen">;

type deleteAllStr<
  str extends string,
  delStr extends string
> = str extends `${infer prefix}${delStr}${infer suffix}`
  ? deleteAllStr<`${prefix}${suffix}`, delStr>
  : str;

type unionStr = deleteAllStr<"test123131test123131test2313332131", "test">;

type getPromise<T extends Promise<unknown>> = T extends Promise<infer valueType>
  ? valueType extends Promise<unknown>
    ? getPromise<valueType>
    : valueType
  : never;

type promiseTest = getPromise<Promise<Promise<Promise<string>>>>;

type reverseArr<T extends unknown[]> = T extends [infer first, ...infer rest]
  ? [...reverseArr<rest>, first]
  : T;

type reverseTest = reverseArr<[1, 2, 3, 4, 5]>;
