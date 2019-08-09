export declare const md5: (data: string, slice?: number) => string;
export declare const pwd: (...args: string[]) => string;
export declare const argv: string[];
export declare const bin: <S>(defParams: S, logic: any) => Promise<void>;
