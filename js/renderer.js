// const bootstrap = require('bootstrap');
// const { remote, ipcRenderer } = require('electron');

const si = require('systeminformation');
const os = require('os');
const osu = require('os-utils');
const nodeDiskInfo = require('node-disk-info');

// const basePath = os.platform() === 'win32' ? 'c:' : '/';
// console.log('cpus', os.cpus());

//https://www.behance.net/gallery/47272469/MARS-UI-Screen-Graphics

const parts = {
	warning: 50,
	danger: 75
}

const change = (val, func) => {
	document.querySelectorAll(`[data-value="${val}"]`).forEach(func)
}

window.addEventListener('DOMContentLoaded', () => {
	const cpuC = document.getElementById('cpu').querySelector('circle');
	const memC = document.getElementById('mem').querySelector('circle');
	let cpuData = [{x: new Date().getTime(), y: 0}]

	const update = () => {
		change('uptime',a => {
			a.innerHTML = Math.floor(si.time().uptime/60/60) + 'h' + ('0' + Math.round(si.time().uptime/60%60)).slice(-2) + 'm'
		})
		osu.cpuUsage(function (v) {
			const val = v * 100;
			cpuData.push({x: new Date().getTime(), y: val})
			setProgress(cpuC, val)
			change('cpu',a => {
				a.textContent = val.toFixed(1) + '%'
				if (val > parts.danger)
					a.classList.add('text-danger')
				else if (val > parts.warning)
					a.classList.add('text-warning')
				else
					a.classList.remove('text-danger', 'text-warning')
			})
		});

		const mem = (1 - osu.freememPercentage()) * 100
		setProgress(memC, mem)
		change('mem',a => {
			a.textContent = mem.toFixed(1) + '%'
			a.classList.remove('text-info', 'text-danger', 'text-warning')
			if (mem > parts.danger)
				a.classList.add('text-danger')
			else if (mem > parts.warning)
				a.classList.add('text-warning')
			else
				a.classList.add('text-info')
		})
		change('curMem', a => {
			a.textContent = ((osu.totalmem() - osu.freemem()) / 1024).toFixed(2) + 'GB'
		})
		change('totMem', a => {
			a.textContent = osu.totalmem() / 1024 + 'GB'
		})


		si.currentLoad().then(data => {
			for (let i = 0; i < data.cpus.length; i++) {
				const cpu = data.cpus[i]
				const el = document.querySelector(`[data-value="cpu-${i}"] .progress-bar`)
				el.style.height = `${cpu.load.toFixed(2)}%`
				el.classList.remove('bg-danger', 'bg-warning', 'bg-info')
				if (cpu.load > parts.danger)
					el.classList.add('bg-danger')
				else if (cpu.load > parts.warning)
					el.classList.add('bg-warning')
				else
					el.classList.add('bg-info')
			}
		})

		si.battery().then(data => {
			change('pow',a => {
				a.textContent = data.percent.toFixed(1) + '%'
				a.classList.remove('text-success','text-info', 'text-danger', 'text-warning')
				if (data.percent === 100)
					a.classList.add('text-success')
				else if (data.percent > parts.danger)
					a.classList.add('text-info')
				else if (data.percent > parts.warning)
					a.classList.add('text-warning')
				else
					a.classList.add('text-danger')
			})
		})
	}

	const init = () => {
		var options = {
			series: [{
				type: 'area',
				data: cpuData.slice()
			}],
			chart: {
				id: 'realtime',
				height: 96,
				type: 'line',
				animations: {
					enabled: true,
					easing: 'linear',
					dynamicAnimation: {speed: 1000}
				},
				toolbar: {show: false},
				zoom: {enabled: false}
			},
			dataLabels: {enabled: false},
			colors: ["#a3eeee"],
			stroke: {
				curve: 'smooth',
				width: 1,
				colors: ['#a3eeee']
			},
			fill: {
				type: 'gradient',
				gradient: {
					type: 'vertical',
					opacityFrom: 0.9,
					opacityTo: 0.5
				}
			},
			markers: {size: 0},
			xaxis: {
				type: 'datetime',
				range: 15000,
				lines: {show: false},
				labels: {show: false},
				axisBorder: {show: false},
				axisTicks: {show: false},
			},
			yaxis: {
				min: 0,
				max: 100,
				lines: {show: false},
				labels: {show: false},
				axisBorder: {show: false},
				axisTicks: {show: false},
			},
			legend: {show: false},
			grid: {show: false}
		};
		var chart = new ApexCharts(document.querySelector("#cpuChart"), options);
		chart.render();
		window.setInterval(function () {
			chart.updateSeries([{
				data: cpuData
			}])
		}, 1000);

		[cpuC, memC].forEach(circ => {
			const radius = circ.r.baseVal.value;
			const circumference = radius * 2 * Math.PI;
			circ.style.strokeDasharray = `${circumference} ${circumference}`;
		})

		si.currentLoad().then(data => {
			for (let i = 0; i < data.cpus.length; i++) {
				const cpu = data.cpus[i]
				const load = document.createElement('div');
				load.classList.add('col')
				load.innerHTML = `<div class="progress progress-v" data-value="cpu-${i}">
	<div class="progress-bar bg-info" role="progressbar" style="height: ${cpu.load.toFixed(2)}%" aria-valuenow="${cpu.load.toFixed(2)}" aria-valuemin="0" aria-valuemax="100"></div>
</div>`;
				document.getElementById('cores').appendChild(load);
			}
		})

		nodeDiskInfo.getDiskInfo().then(disks => {
			disks = disks.filter(a => a.mounted !== '100%')
			for (let i = 0; i < disks.length; i++) {
				const disk = disks[i]
				// console.log(disk)
				// console.log('Filesystem:', disk.filesystem);
				// console.log('Blocks:', disk.blocks);
				// console.log('Used:', disk.used);
				// console.log('Available:', disk.available);
				// console.log('Capacity:', disk.capacity);
				// console.log('Mounted:', disk.mounted, '\n');
				const load = document.createElement('div');
				load.classList.add('col-4')
				load.innerHTML = `<div class="card card-progress h-100">
	<div class="card-body">
		<p class="text-small m-0">${disk.mounted}</p>
		<p class="m-0">${disk.filesystem}</p>
		<p class="m-0">${disk.capacity}</p>
	</div>
	<div class="progress-bar bg-info" role="progressbar" style="width: ${disk.capacity}" aria-valuenow="${disk.capacity.replace('%', '')}" aria-valuemin="0" aria-valuemax="100"></div>
</div>`;
				document.getElementById('storage').appendChild(load);
			}
		})

		si.graphics().then(data => {
			for (let i = 0; i < data.controllers.length; i++) {
				const gcd = data.controllers[i]
				const load = document.createElement('div');
				load.classList.add('col')
				load.innerHTML = `<p class="text-muted">${gcd.model}</p>`;
				document.getElementById('graphics').appendChild(load);
			}
		})

		change('name', a => {
			a.textContent = os.hostname()
		})

		si.system().then(data => {
			change('manufacturer', a => {
				a.textContent = `${data.manufacturer} - ${data.serial}`
			})
			change('serial', a => {
				a.textContent = `${os.type()} ${os.arch()} v${os.release()}`
			})
		})

		update()
		setInterval(update, 1000)
	}
	init()
})


function setProgress(circle, percent) {
	const radius = circle.r.baseVal.value;
	const circumference = radius * 2 * Math.PI;
	circle.style.strokeDashoffset = circumference - percent / 100 * circumference;
}

si.system()
	.then(data => console.log('system', data))
	.catch(error => console.error(error));
si.bios()
	.then(data => console.log('bios', data))
	.catch(error => console.error(error));
si.baseboard()
	.then(data => console.log('baseboard', data))
	.catch(error => console.error(error));
si.chassis()
	.then(data => console.log('chassis', data))
	.catch(error => console.error(error));

si.cpu()
	.then(data => console.log('cpu', data))
	.catch(error => console.error(error));
si.cpuCurrentspeed()
	.then(data => console.log('cpuCurrentspeed', data))
	.catch(err => console.error(err))
si.cpuTemperature()
	.then(data => console.log('cpuTemperature', data))
	.catch(err => console.error(err))
si.mem()
	.then(data => console.log('mem', data))
	.catch(err => console.error(err))
si.battery()
	.then(data => console.log('battery', data))
	.catch(err => console.error(err))

console.warn(os.networkInterfaces())