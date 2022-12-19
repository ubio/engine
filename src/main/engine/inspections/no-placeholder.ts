import { Action } from '../action.js';
import { ActionInspection, InspectionLevel, InspectionReport } from '../inspection.js';

export class NoPlaceholders extends ActionInspection {

    *inspect(action: Action): Iterable<InspectionReport> {
        if (action.type === 'placeholder') {
            yield {
                name: 'no-placeholder',
                level: InspectionLevel.Error,
                message: `Placeholders are not allowed`,
            };
        }
    }

}
