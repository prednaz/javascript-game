declare module "perf_hooks" {
    declare module.exports: {
        performance: {
            now(): number
        }
    };
}
