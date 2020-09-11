const {ContentType} = require('../../dist');

test('allure.attachment()', () => {
	allure.attachment('TEXT-attachment', 'line1\nline2\nline3\n', ContentType.TEXT);
	allure.attachment('CSS-attachment', 'CSS content', ContentType.CSS);
	allure.attachment('CSV-attachment', 'a,b,c,d,e,f\n1,2,3,4,5,6', ContentType.CSV);
	allure.attachment('JSON-attachment',
		JSON.stringify({
			string: 'foobar',
			number: 1,
			boolean: true,
			function: () => console.log('Ok it works.')
		}, null, 2),
		ContentType.JSON);
	// Allure.attachment('JPEG-attachment', ContentType.JPEG, '');
	// Allure.attachment('PNG-attachment', ContentType.PNG, '');
	// allure.attachment('SVG attachment', ContentType.SVG, '');

	expect(1 + 2).toBe(3);
});

