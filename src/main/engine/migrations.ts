export const actionRenameMap: { [key: string]: string } = {

};

export const pipeRenameMap: { [key: string]: string } = {
    'Browser.getBlob': 'Data.getBlob',
    'Flow.computeOutcome': 'Data.computeOutcome',
};

export function migrateActionSpec(spec: any = {}): any {
    const renamedType = actionRenameMap[spec.type];
    if (renamedType) {
        spec.type = renamedType;
    }
    return spec;
}

export function migratePipeSpec(spec: any = {}): any {
    const renamedType = pipeRenameMap[spec.type];
    if (renamedType) {
        spec.type = renamedType;
    }
    return spec;
}
