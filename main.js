const { app, BrowserWindow } = require('electron')
// const os = require('os')
// const disk = require('diskusage')
// const basePath = os.platform() === 'win32' ? 'c:' : '/'

function createWindow () {
	const win = new BrowserWindow({
		titleBarStyle: 'customButtonsOnHover',
		frame: false,
		width: 1200,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	})

	win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// disk.check(basePath)
// 	.then(info => console.log(info))
// 	.catch(err => console.error(err))