function DOMparseChildren(children: any) {
	return children.map((child: any) => {
		if (typeof child === 'string') {
			return document.createTextNode(child);
		}
		return child;
	});
}

function nonNull(val: boolean, fallback: any) {
	return val ? val : fallback;
}

function DOMparseNode(element: any, properties: any, children: any) {
	const el = document.createElement(element);

	for (const key of Object.keys(nonNull(properties, {}))) {
		el[key] = properties[key];
	}

	for (const child of DOMparseChildren(children)) {
		el.appendChild(child);
	}

	return el;
}

export function DOMcreateElement(element: any, properties: any, ...children: any) {
	if (typeof element === 'function') {
		return element({
			...nonNull(properties, {}),
			children,
		});
	}
	return DOMparseNode(element, properties, children);
}
