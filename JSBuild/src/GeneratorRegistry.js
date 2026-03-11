const generators = new Map();

function registerGenerator(type, modelName, runFunction) {

    generators.set(modelName, {
        type,
        run: runFunction
    });

}

function getGenerator(modelName) {
    return generators.get(modelName);
}

function findGeneratorByType(type, stack) {

    for (const model of stack.generators) {

        const gen = generators.get(model);

        if (gen && gen.type === type)
            return gen;

    }

    return null;
}

export {
    registerGenerator,
    getGenerator,
    findGeneratorByType
};