"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.IVisualHost;
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";
export class Visual implements IVisual {
    private hostService: IVisualHost;
    private root: Selection<HTMLElement>;
    private settings: VisualSettings;
    private weekDays: string[];
    private customDate: Date;
    private currentDateText: any;
    private selectedDate: Date;
    private COUNT_DAYS_WEEK: number = 7;
    private calendarGrid: any;

    constructor(options: VisualConstructorOptions) {
        if(document)
        {
            this.hostService = options.host;
            this.weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
            this.customDate = new Date();
            this.root = d3.select(options.element);

            this.root.append('div').classed('calendar-container', true)
                .append('div').classed('nav-panel', true)
                .append('div').classed('nav-month', true);

            this.currentDateText = d3.select('div.nav-month').append('div').classed('currentDateText', true);
            d3.select('div.nav-month')
                .append('span')
                .attr('class', 'prev-month glyphicon glyphicon-chevron-up');

            d3.select('div.nav-month')
                .append('span')
                .attr('class', 'next-month glyphicon glyphicon-chevron-down');

            d3.select('div.calendar-container')
                .append('div')
                .classed('week', true);

            d3.select('div.calendar-container')
                .append('div')
                .classed('calendar', true)
                .append('div')
                .classed('calendar-grid', true);

            this.calendarGrid = d3.select('div.calendar').append('div').classed('calendar-grid', true);

            this.weekDays.forEach((item) => {
                d3.select('div.week').append('span').text(item);
            });

            this.buildVisualCalendar(options, new Date());

            d3.select('span.prev-month').on('click', () => {
                this.customDate.setMonth(this.customDate.getMonth() - 1);
                this.buildVisualCalendar(options, this.customDate);
            });

            d3.select('span.next-month').on('click', () => {
                this.customDate.setMonth(this.customDate.getMonth() + 1);
                this.buildVisualCalendar(options, this.customDate);
            });

        }
    }

    public buildVisualCalendar(options: VisualConstructorOptions, date: Date):void {
        debugger;
        let daysArray: any = [];
        let countDays = this.daysInMonthCalculate(date);
        let firstDayInMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        let lastDayInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDay();
        let restrictionMin = firstDayInMonth === 0 ? this.COUNT_DAYS_WEEK : firstDayInMonth;
        let restrictionMax = lastDayInMonth === 0 ? this.COUNT_DAYS_WEEK : (this.COUNT_DAYS_WEEK - lastDayInMonth) + this.COUNT_DAYS_WEEK;

        for (let i = 0; i < restrictionMin - 1; i++) {
            daysArray.unshift(this.calendarDayCreate(new Date(date.getFullYear(), date.getMonth(), - i), false));
        }

        for (let i = 0; i < countDays;) {
            daysArray.push(this.calendarDayCreate(new Date(date.getFullYear(), date.getMonth(), ++i), true));
        }

        for (let i = 0; i < restrictionMax;) {
            daysArray.push(this.calendarDayCreate(new Date(date.getFullYear(), date.getMonth() + 1 , ++i), false));
        }

        this.calendarGrid.html('');

        daysArray.forEach((item) => {
            item.on('click', () => {
                this.currentDateText.text(item._groups[0][0].date.toLocaleDateString('ru', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }));
                d3.select('div[selected]').attr('selected', null);
                if(item._groups[0][0].getAttribute('selected') === null) {
                    item.attr('selected', 'selected');
                    this.selectedDate = item._groups[0][0].date;
                }
            });
            this.calendarGrid.node().append(item._groups[0][0]);
        });

        this.currentDateText.text(this.selectedDate != null ? this.selectedDate.toLocaleDateString('ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : new Date().toLocaleDateString('ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));

    }

    public update(options: VisualUpdateOptions) {
        //this.buildVisual();
    }

    public calendarDayCreate(date: Date, currentMonth: boolean): Selection<HTMLDivElement> {
        let elementDay = d3.create('div')
                           .classed('dayGrid', true)
                           .property('date', new Date(date))
                           .text(date.getDate());

        if(date.toDateString() === new Date().toDateString())
        {
            elementDay.property('isCurrentDay', true);
            elementDay.classed('currentDay', true);
        }

        if(!currentMonth) {
            elementDay.classed('dayAnotherMonth', true);
            elementDay.attr('dayAnotherMonth', 'dayAnotherMonth');
        }

        if(this.selectedDate != null && date.toDateString() == this.selectedDate.toDateString()) {
            elementDay.attr('selected', 'selected');
        }

        return elementDay;

    }

    public daysInMonthCalculate(date: Date): number {
        return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
    }

}