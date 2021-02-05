import type {ContentType as AllureContentType} from 'allure-js-commons';

enum CustomContentType {
	HTML = 'text/html'
}

export type ContentType = AllureContentType | CustomContentType;
