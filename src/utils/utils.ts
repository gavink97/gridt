export async function GetActiveTab(): Promise<number> {
	const res = await browser.tabs.query({ active: true, currentWindow: true });
	if (res[0].id === browser.tabs.TAB_ID_NONE) {
		return -1;
	}

	return res[0].id ?? -1;
}
