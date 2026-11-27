/** Local types: this workspace's @mappedin/events build ships JS without declarations. */
declare module '@mappedin/events' {
	export class EventsManager {
		constructor(mapData: unknown);
		load(): Promise<void>;
		readonly events: Array<{
			name: string;
			description?: string;
			startDate: Date;
			endDate: Date;
		}>;
	}
}
