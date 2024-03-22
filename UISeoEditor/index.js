//http://localhost:8080/
// https://nubify.ru/
// Создаем XMLHttpRequest для чтения index.html
const xhr = new XMLHttpRequest()
xhr.open('GET', chrome.runtime.getURL('index.html'), true)

xhr.onreadystatechange = function () {
	if (xhr.readyState == 4) {
		const el = document.createElement('div')
		el.innerHTML = xhr.responseText
		el.classList.add('mainElement')
		document.body.insertAdjacentElement('beforeend', el)
	}
}
xhr.send()

// при нажатии на кнопку добавить страницу
document.addEventListener('click', function (e) {
	if (e.target.closest('#add_page')) {
		const menu = document.querySelector('.jquery-center-menu')
		menu.classList.toggle('active')
	}

	if (e.target.closest('#submit-buttonPlagin')) {
		const menu = document.querySelector(
			'.jquery-logs-menu, .wrapperListOfAltTags, .wrapperListOfStrong, .wrapperListOfCapital, .wrapperListOfTitleSuffix, .wrapperListOfLink, .wrapperListOfReplaceAll, .wrapperListOfReplacePage, .wrapperListOfAnalysis'
		)
		menu.classList.add('active') //не скрывать форму при повторном нажатии
	}
})

// активация при нажатии на кнопки Ctrl + Shift + Z
document.addEventListener('keyup', function (e) {
	if (e.ctrlKey && e.code === 'KeyZ') {
		const rightMenu = document.querySelector('.jquery-right-menu')
		const otherMenus = document.querySelectorAll(
			'.jquery-center-menu, .jquery-logs-menu, .wrapperListOfAltTags, .wrapperListOfStrong, .wrapperListOfCapital, .wrapperListOfTitleSuffix, .wrapperListOfLink, .wrapperListOfReplaceAll, .wrapperListOfReplacePage, .wrapperListOfAnalysis'
		)

		if (!rightMenu) {
			return
		}

		// Переключение для .jquery-right-menu
		rightMenu.classList.toggle('active')

		modul.showIgmAltField() // Показать поле ImgAlt
		modul.showFormStrong() // Показать поле Strong
		modul.showFormCapital() // Показать поле Capital
		modul.showFormTitleSuffix() // Показать поле TitleSuffix
		modul.showFormLink() // Показать Форму Link
		modul.showFormReplaceAll() // Показать форму ReplaceAll
		modul.showFormReplacePage() // Показать форму ReplacePage
		modul.showFormAnalysise() // Показать форму Analysise

		if (rightMenu.classList.contains('active')) {
			// Если jquery-right-menu активен, то выполняем ваш код
			modul.showPagesInPageBlockPlagin()
			modul.numberOfCities()
			modul.numberOfStrong()
			modul.numberOfCapital()
			modul.numberOfTitleSuffix()
			modul.deleteAllPage()
			modul.addLangSite()
			modul.updateWhenPrinting()
			document.querySelectorAll('.editable').forEach(addCheckbox)
			modul.searchPages()
			modul.closeWindowLogs()

			// Проверка наличия systemLogs и инициализация WebSocket, если еще не инициализировано
			const logsTextarea = document.getElementById('systemLogs')
			if (
				logsTextarea &&
				(!window.socket || window.socket.readyState === WebSocket.CLOSED)
			) {
				modul.initiateWebSocket() // вызов функции вебсокит
			}
		} else {
			// Если меню не активно, удаляем чекбоксы
			removeCheckboxes()
		}

		// Для .jquery-center-menu и .jquery-logs-menu всегда удаляем класс 'active'
		otherMenus.forEach(menu => {
			menu.classList.remove('active')
		})
	}
})

// Определение пустого массива для хранения порядка флажков (чекбоксов).
let checkboxesOrder = []

// Функция для поиска класса чекбокса в списке классов элемента.
function findCheckboxClass(element) {
	// Возвращает первый класс, который соответствует шаблону "checkbox_<число>" или null, если такого класса не найдено.
	return (
		Array.from(element.classList).find(className =>
			/^checkbox_\d+$/.test(className)
		) || null
	)
}

// Функция для добавления новой строки к каждой строке текста.
function appendNewlineToEachLine(text) {
	// Разбивает текст на строки, добавляет новую строку к каждой строке и возвращает объединенные строки.
	const lines = text.split('\n').map(line => line.trim() + '\n')
	return lines.join('')
}

// Функция для обновления выбранных чекбоксов.
function updateSelectedCheckboxes() {
	// Получает текст для каждого выбранного чекбокса и сохраняет его в массиве.
	const selectedTexts = checkboxesOrder
		.map(name => {
			const checkbox = document.querySelector(
				`.custom-checkbox[name="${name}"]`
			)
			if (checkbox && checkbox.checked) {
				return `[${checkbox.parentNode.innerText.trim()}]`
			}
			return null
		})
		.filter(Boolean)

	// Обновляет значение элемента с классом 'selected_checkboxes' выбранными текстами чекбоксов.
	document.querySelector('.selected_checkboxes').value =
		selectedTexts.join('\n\n') + '\n'
}

// Функция для добавления чекбокса к элементу.
function addCheckbox(element) {
	// Находит имя класса чекбокса или использует значение по умолчанию 'checkbox_0', если класс не найден.
	const checkboxClassName = findCheckboxClass(element)
	const checkboxName = checkboxClassName ? checkboxClassName : 'checkbox_0'

	// Проверяет, что элемент не является частью определенных меню и не содержит чекбокс.
	if (
		!element.closest('.jquery-right-menu') &&
		!element.closest('.jquery-center-menu') &&
		!element.querySelector('.custom-checkbox')
	) {
		const checkbox = document.createElement('input')
		checkbox.type = 'checkbox'
		checkbox.className = 'custom-checkbox'
		checkbox.name = checkboxName
		element.insertAdjacentElement('afterbegin', checkbox)

		// Добавляет обработчик события, который обновляет список выбранных чекбоксов и счетчик символов при изменении состояния чекбокса.
		checkbox.addEventListener('change', function () {
			if (this.checked && !checkboxesOrder.includes(this.name)) {
				checkboxesOrder.push(this.name)
			} else {
				checkboxesOrder = checkboxesOrder.filter(name => name !== this.name)
			}
			updateSelectedCheckboxes()
			modul.updateCharacterCount()
			updateSystemMessage() // Обновляет длину символов в Системном сообщении для GPT
		})
	}
}

// Функция для удаления чекбоксов
function removeCheckboxes() {
	document.querySelectorAll('.custom-checkbox').forEach(function (checkbox) {
		checkbox.remove()
	})
}

// Обновляет длину символов в Системном сообщении для GPT
function updateSystemMessage() {
	let textarea = document.getElementById('systemMessagePlagin')

	if (textarea) {
		let currentContent = textarea.value

		// Формирование новой строки с обновленной длиной символов
		let updatedLengthString = `${modul.updateCharacterCount()}-${
			modul.updateCharacterCount() + 10
		}`

		// Замена старой строки с длиной символов на новую
		let newContent = currentContent.replace(/\d+-\d+/, updatedLengthString)

		textarea.value = newContent
	}
}

// свернуть развернуть меню при нажатии на кнопку
document.addEventListener('click', function (e) {
	if (e.target.id === 'hide_menu') {
		if (e.target.innerText === '+') {
			e.target.innerText = '–'
		} else {
			e.target.innerText = '+'
		}

		// Находим родительский элемент (в данном случае, div с классом "header")
		const parentDiv = e.target.parentNode

		// Ищем следующий элемент на том же уровне
		const menu = parentDiv ? parentDiv.nextElementSibling : null

		if (menu) {
			menu.classList.toggle('active')
		}
	}
})

// --------------------------------------------Перетаскивание меню--------------------------------------------- //
let draggedElement = null
let offsetX = 0
let offsetY = 0

document.addEventListener('mousedown', e => {
	if (e.target.classList.contains('headeR')) {
		draggedElement = e.target.closest(
			'.jquery-right-menu, .jquery-center-menu, .jquery-logs-menu, .wrapperListOfAltTags, .wrapperListOfStrong, .wrapperListOfCapital, .wrapperListOfTitleSuffix, .wrapperListOfLink, .wrapperListOfReplaceAll, .wrapperListOfReplacePage, .wrapperListOfAnalysis'
		)
		const rect = draggedElement.getBoundingClientRect()
		offsetX = e.clientX - rect.left
		offsetY = e.clientY - rect.top
	}
})

document.addEventListener('mousemove', e => {
	if (draggedElement) {
		draggedElement.style.left = e.clientX - offsetX + 'px'
		draggedElement.style.top = e.clientY - offsetY + 'px'
	}
})

document.addEventListener('mouseup', () => {
	draggedElement = null
})
// --------------------------------------------Перетаскивание меню--------------------------------------------- //

/* ----- */
//Запрос то что будет происходить при нажатии кнопки Отправить
document.addEventListener('click', function (event) {
	if (event.target.matches('#submit-buttonPlagin')) {
		//Запрос к GPT
		modul.queryToGPT()
	}
})

!(function () {
	function timeout(ms) {
		return new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error(`Таймаут запроса после ${ms} миллисекунд`))
			}, ms)
		})
	}

	let stopRequests = false

	// Установка обработчика клика на уровне документа для остановки запроса к GPT
	document.addEventListener('click', function (event) {
		if (event.target && event.target.id === 'stopButton') {
			stopRequests = true
		}
	})

	async function queryToGPT() {
		sendNewRequest() // Инициализация нового запроса
		const checkedCheckboxes = getCheckedCheckboxes() // Получение массива отмеченных чекбоксов

		// Отображение индикатора загрузки и установка темного фона во время обработки запроса
		document.getElementById('spinner').style.display = 'block'
		document.body.classList.add('darkFon')

		const spinnerLogsTime = document.querySelector('.spinnerLogsTime') // Получение элемента для вывода времени
		const selectedText = document.getElementById('selected-text').value // Получение выбранного текста
		const prefixForUrl = document.getElementById('prefixForUrl').value // Получение значения из поля keyForUrl
		const selectedCityString = document.getElementById('selected-city').value // Получение строки с городами
		const systemMessage = document.getElementById('systemMessagePlagin').value // Получение системного сообщения
		const charCountElement = document.getElementById('characters').value // Получение количества символов
		const logsDiv = document.getElementById('systemLogs') // Получение div для логов
		const logsList = document.querySelector('.logs-list') // Получение списка логов

		const cityArray = selectedCityString.split('\n') // Преобразование строки с городами в массив
		const textArray = selectedText
			.split(']')
			.map(str => str.replace('[', '').trim())
			.filter(Boolean) // Разбиваем текст на строки

		const startTime = new Date() // Запись времени начала запроса

		// Запуск интервала для обновления времени, прошедшего с начала запроса
		const intervalId = setInterval(() => {
			const now = new Date()
			const timeElapsed = now - startTime
			const minutes = Math.floor(timeElapsed / 60000)
			const seconds = ((timeElapsed % 60000) / 1000).toFixed(0)
			const milliseconds = (timeElapsed % 1000).toFixed(0)
			spinnerLogsTime.textContent = `${minutes}:${seconds.padStart(
				2,
				'0'
			)}.${milliseconds.padStart(3, '0')}`
		}, 100)

		const MAX_RETRIES = 3

		// Обход массива городов
		for (const [cityIndex, city] of cityArray.entries()) {
			let textIndex = textArray.length, // Получаем количество строк города
				lineCity = 1 // устонавливаем первый индекс для первого города
			if (lineCity >= textIndex) {
				// если индекс строки больше или равно общему количеству строк то присваиваем 1
				lineCity = 1
			}
			for (const [i, text] of textArray.entries()) {
				let currentLineCheckbox = checkedCheckboxes[i] // Перебираем все полученные чекбоксы
				if (stopRequests) {
					logsDiv.innerHTML +=
						'Остановлено пользователем обработку текстов для текущего города.<br>'
					break // Прекратите обработку текстов для текущего города
				}
				let retries = 0

				while (retries < MAX_RETRIES) {
					try {
						// Отправка запроса на сервер с одним городом и одной строкой текста
						const response = await Promise.race([
							fetch('/apigptPlagin', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/x-www-form-urlencoded',
								},
								body: new URLSearchParams({
									selectedText: text,
									selectedCity: city.trim(),
									systemMessage,
									charCountElement,
									cityIndex: cityIndex,
									textIndex: lineCity++,
									totalNumberOfLines: textIndex,
									btnFilterBoolArr: btnFilterBoolArr,
								}),
							}),
							timeout(120000),
						])

						if (!response.ok) {
							console.error(
								`Ошибка с городом ${city} и текстом ${text}:`,
								response.status
							)
							logsDiv.innerHTML += `Ошибка с городом ${city} и текстом ${text}: ${response.status}<br>`
							retries++
							continue
						}

						const data = await response.text()
						sendToGoServer(data, currentLineCheckbox, prefixForUrl) // Передаем ответ GPT и чекбокc строки
						console.log(data)
						break
					} catch (error) {
						console.error(`Ошибка с городом ${city} и текстом ${text}:`, error)
						logsDiv.innerHTML += `Ошибка с городом ${city} и текстом ${text}: ${error}<br>`
						retries++
					}

					if (retries == MAX_RETRIES) {
						logsDiv.innerHTML += `Превышено максимальное количество попыток для города ${city} и текста ${text}.<br>`
					}

					await new Promise(resolve => setTimeout(resolve, 1000))
				}
			}
			if (stopRequests) {
				logsDiv.innerHTML +=
					'Остановлено пользователем обработку остальных городов.<br>'
				stopRequests = false
				break // Прекратите обработку остальных городов
			}
		}

		clearInterval(intervalId)

		const endTime = new Date()
		const elapsedTime = endTime - startTime
		const minutes = Math.floor(elapsedTime / 60000)
		const seconds = ((elapsedTime % 60000) / 1000).toFixed(0)
		const milliseconds = (elapsedTime % 1000).toFixed(0)

		logsDiv.innerHTML += `<p class='TotalRequestProcessingTime'>Общее время обработки запроса: ${minutes} минут, ${seconds.padStart(
			2,
			'0'
		)} секунд, ${milliseconds.padStart(3, '0')} миллисекунд.</p>`

		logsList.scrollTop = logsList.scrollHeight

		showPagesInPageBlockPlagin()
		document.getElementById('spinner').style.display = 'none'
		document.body.classList.remove('darkFon')
	}

	window.isNewRequest = false // глобальная переменная для отслеживания нового запроса
	// Функция для создания Вебсокит соединения
	function initiateWebSocket() {
		// Указывает, используется ли безопасное соединение
		const isSecure = window.location.protocol === 'https:'

		// Получает имя хоста динамически
		const hostName = window.location.hostname
		
		// Получение порта из URL, если он предоставлен, иначе используется порт по умолчанию 8080
		const port = window.location.port || '8080'

		// Устанавливает протокол в зависимости от того, является ли соединение безопасным
		const protocol = isSecure ? 'wss' : 'ws'
		console.log(protocol, hostName, port)

		// Если сокет уже открыт или открывается, не создаем новый
		if (window.socket && window.socket.readyState !== WebSocket.CLOSED) {
			return
		}

		// Динамически создает URL веб-сокета
		if(hostName == "localhost"){
			window.socket = new WebSocket(`${protocol}://${hostName}:8080/ws-endpoint`) //lock
		}else {
			window.socket = new WebSocket(`${protocol}://${hostName}/ws-endpoint`); //web
		}

		window.socket.addEventListener('open', event => {
			console.log('Открытие веб-сокета:', event)
		})

		window.socket.addEventListener('error', event => {
			console.error('Ошибка веб-сокета:', event)
		})

		window.socket.addEventListener('message', event => {
			const logsDiv = document.getElementById('systemLogs'),
				logsList = document.querySelector('.logs-list')
			if (logsDiv) {
				if (window.isNewRequest) {
					logsDiv.innerHTML = '' // Используйте внутренний HTML вместо значения
					window.isNewRequest = false
				}

				// Добавьте новый HTML-контент. Убедитесь, что он очищен, чтобы предотвратить XSS-атаки.
				logsDiv.innerHTML += event.data // Добавление разрыва строки с помощью <br>

				// Автоматическая прокрутка вниз
				logsList.scrollTop = logsList.scrollHeight
			} else {
				console.error('Log container not found!')
			}
		})

		window.socket.addEventListener('close', event => {
			console.log('Вебсокет закрыт:', event)

			// Переподключение через 1 секунд после закрытия
			setTimeout(initiateWebSocket, 1)
		})
	}

	// Функция для отправки нового запроса вебсокет
	function sendNewRequest() {
		window.isNewRequest = true // установите этот флаг перед отправкой нового запроса
		// ваш код для отправки нового запроса через WebSocket
		if (window.socket && window.socket.readyState === WebSocket.OPEN) {
			// window.socket.send("Your new request data here");
		}
	}

	//Количество отмеченных символов
	function updateCharacterCount() {
		const selectedTextElement = document.getElementById('selected-text')
		const charCountElement = document.getElementById('characters')
		const currentCharCount = selectedTextElement.value.length
		charCountElement.value = currentCharCount
		return currentCharCount
	}

	// Получаем текущий url
	var baseUrl = window.location.origin // Начальный домен, например "https://example.com"
	var url = window.location.href // Получаем текущий URL
	var parts = url.split('/')
	var index = parts.indexOf('sites')
	if (index !== -1 && parts.length > index + 2) {
		var region = parts[index + 1]
		var service = parts[index + 2]
	}

	// Добавить язык сайта в форму
	function addLangSite() {
		// Получаем элемент textarea по его ID
		let textarea = document.getElementById('systemMessagePlagin')

		// Получаем текущий текст из textarea
		let text = textarea.value

		const languageMapping = {
			at: 'НЕМЕЦКОМ',
			be: 'НИДЕРЛАНДСКОМ',
			cz: 'ЧЕШКОМ',
			fr: 'ФРАНЦУЗСКОМ',
			gb: 'АНГЛИЙСКОМ',
			hu: 'ВЕНГЕРСКОМ',
			no: 'НОРВЕЖСКОМ',
			pl: 'ПОЛЬСКОМ',
			ru: 'РУССКОМ',
		}

		let siteLanguage = languageMapping[region] || 'Неизвестный язык'

		// Заменяем "lang" на нужное значение языка
		text = text.replace(/lang/g, siteLanguage)

		// Устанавливаем обновленный текст обратно в textarea
		textarea.value = text
	}

	// Обновляем количество символов при воде в форму
	function updateWhenPrinting() {
		const selectedText = document.querySelector('#selected-text')
		selectedText.addEventListener('input', () => {
			updateCharacterCount()
			updateSystemMessage() // Обновляет длину символов в Системном сообщении для GPT
		})
	}

	// Функция showPagesInPageBlockPlagin вызывается для отправки запроса на сервер и получения данных о страницах
	function showPagesInPageBlockPlagin() {
		let startTime = performance.now();
		if (region && service) {
			var dataToSend = {
				region: region,
				service: service,
			};
	
			fetch('/showpagesinpageblockplagin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(dataToSend),
			})
			.then(response => response.json())
			.then(data => {
				if (data.error) {
					console.error('Страницы не найдены:', data.message);
				} else {
					const pages_list_item = document.querySelector('.pages_list_item');
					const total_pages = document.querySelector('.total_pages');
					const btnDeleteAllPages = document.querySelector('.deleteAllPages');
					const styleSitemap = document.querySelector('.styleSitemap');
	
					total_pages.textContent = data.total_files;
	
					btnDeleteAllPages.style.display = +total_pages.textContent > 0 ? 'block' : 'none';
					styleSitemap.style.display = +total_pages.textContent > 0 ? 'inline-block' : 'none';
	
					const fragment = document.createDocumentFragment();
					data.files_with_html.forEach((link, i) => {
						const div = document.createElement('div');
						div.className = 'pageWrapper';
	
						const a = document.createElement('a');
						a.className = 'linkPage';
						a.href = `${url}pages/${link}`;
						a.target = '_blank';
						a.textContent = data.files_without_html[i].toUpperCase();
						div.appendChild(a);
	
						const button = document.createElement('button');
						button.className = 'deletePage';
						button.dataset.link = link;
						button.textContent = 'X';
						div.appendChild(button);
	
						fragment.appendChild(div);
					});
	
					pages_list_item.innerHTML = '';
					pages_list_item.appendChild(fragment);
	
					deletePage(region, service);
	
					let endTimer = performance.now();
					let timeTaken = (endTimer - startTime) / 1000;
					console.log(timeTaken);
				}
			})
			.catch(error => {
				console.error('Ошибка:', error);
			});
		} else {
			console.log(region, service + ' не найдены');
		}
	}
	

	

	// Удалить одну страницу
	function deletePage(region, service) {
		const deleteBtn = document.querySelectorAll('.deletePage'),
			btnDeleteAllPages = document.querySelector('.deleteAllPages'),
			styleSitemap = document.querySelector('.styleSitemap') // Карта сайта

		deleteBtn.forEach(deleteP => {
			deleteP.addEventListener('click', function () {
				const link = this.getAttribute('data-link')

				// Уменьшаем счетчик количества страниц
				let total_pages = +document.querySelector('.total_pages').textContent
				total_pages--
				document.querySelector('.total_pages').textContent = total_pages

				// Показывать или скрывать кнопку Удалить все
				if (total_pages > 0) {
					btnDeleteAllPages.style.display = 'block'
				} else {
					btnDeleteAllPages.style.display = 'none'
					styleSitemap.style.display = 'none'
				}

				// Поиск ближайшего родительского элемента с классом 'pageWrapper' и изменение его стиля
				const pageWrapper = this.closest('.pageWrapper')
				if (pageWrapper) pageWrapper.style.display = 'none'

				// Создаем объект для хранения параметров запроса
				var data = new URLSearchParams()
				// Добавляем параметры region, service и link к запросу
				data.append('region', region)
				data.append('service', service)
				data.append('link', link)

				// Выполняем запрос к серверу с использованием fetch и методом POST
				fetch('/deletepagesplagin', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: data.toString(),
				})
					// Обрабатываем полученные данные
					.then(response => response.json())
					.then(data => {
						// Добавьте здесь ваш код для обработки ответа, если необходимо.
					})
					// В случае возникновения ошибки выводим ее в консоль
					.catch(error => {
						console.error('Ошибка:', error)
					})
			})
		})
	}

	// Удалить все страницы
	function deleteAllPage() {
		const btnDeleteAllPages = document.querySelector('.deleteAllPages'),
			styleSitemap = document.querySelector('.styleSitemap') // Карта сайта
		btnDeleteAllPages.addEventListener('click', function () {
			// Подтверждение на удаление
			if (confirm('Вы хотите удалить все страницы?')) {
				// Обнуляем счетчик количества страниц, список городов и саму кнопку
				document.querySelector('.total_pages').textContent = ''
				document.querySelector('.pages_list_item').innerHTML = ''
				styleSitemap.style.display = 'none'
				btnDeleteAllPages.style.display = 'none'

				// Создаем объект для хранения параметров запроса
				var data = new URLSearchParams()
				// Добавляем параметры region, service и link к запросу
				data.append('region', region)
				data.append('service', service)

				// Выполняем запрос к серверу с использованием fetch и методом POST
				fetch('/deleteAllPagesPlagin', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: data.toString(),
				})
					// Обрабатываем полученные данные
					.then(response => response.json())
					.then(data => {
						// Добавьте здесь ваш код для обработки ответа, если необходимо.
					})
					// В случае возникновения ошибки выводим ее в консоль
					.catch(error => {
						console.error('Ошибка:', error)
					})
			}
		})
	}

	// Функция отправки текста на сервер Go для создания LadingPage
	async function sendToGoServer(text, currentLineCheckbox, prefixForUrl) {
		const objectWithImgAndInputValues =
			createsAnObjectWithPicturesAndInputValue() //объект со значениями имг и инпута
		const objectJsonImg = JSON.stringify(objectWithImgAndInputValues) // Переобразуем в json для отправки на сервер

		// Отправляет все ключи слова Strong на сервер
		const sendsAllStrong = sendsAllStrongWordKeysToTheServer()
		// Отправляет все ключи слова Capital на сервер
		const sendsAllCapital = sendsAllCapitalWordKeysToTheServer()
		// Отправляет Title Suffix на сервер
		const sendTitleSuffix = sendsTitleSuffixToTheServer()
		// Отправляет Links на сервер
		const sendAllLink = sendsAllLinksToTheServer()

		const data = new URLSearchParams()
		data.append('text', text)
		data.append('checked', currentLineCheckbox) // Тут получает чекбокс отмеченой строки
		data.append('baseUrl', baseUrl)
		data.append('region', region)
		data.append('service', service)
		data.append('prefixForUrl', prefixForUrl)
		data.append('imgInputPairs', objectJsonImg) // Добавление объекта как строки JSON
		data.append('sendsAllStrong', sendsAllStrong) // Отправляет все ключи слова Strong на сервер
		data.append('sendsAllCapital', sendsAllCapital) // Отправляет все ключи слова Capital на сервер
		data.append('sendTitleSuffix', sendTitleSuffix) // Отправляет Title Suffix на сервер
		data.append('sendAllLink', sendAllLink) // Отправляет Links на сервер
		try {
			const response = await fetch('/CreateLandingPagePlagin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: data,
			})
		} catch (error) {
			console.error('Ошибка при отправке запроса:', error)
		}
	}

	// Массив для хранения порядка отмеченных чекбоксов
	let checkedOrder = []

	// Обработчик события изменения (change) на родительском элементе (тело документа)
	document.body.addEventListener('change', event => {
		// Проверка, является ли измененный элемент чекбоксом
		if (event.target.type === 'checkbox') {
			// Если чекбокс был отмечен
			if (event.target.checked) {
				// Добавляем имя чекбокса в массив
				checkedOrder.push(event.target.name)
			} else {
				// Если чекбокс был снят, удаляем его имя из массива
				checkedOrder = checkedOrder.filter(name => name !== event.target.name)
			}
		}
	})

	// Функция для получения списка имен всех отмеченных чекбоксов в порядке их выбора
	function getCheckedCheckboxes() {
		// Возвращаем копию массива, чтобы изолировать оригинальный массив от внешних изменений
		return [...checkedOrder]
	}

	// Функция для подсчета количество введенных городов
	function numberOfCities() {
		const selectedCity = document.querySelector('#selected-city')
		const numberOfCitiesElement = document.querySelector('.numberOfCities')

		function updateNumberOfCities() {
			// Убираем пробелы и переносы строк в начале и конце,
			// не затрагивая пробелы и переносы строк в середине текста.
			const cleanedValue = selectedCity.value.replace(/^\s+|\s+$/g, '')

			const lines = cleanedValue
				.split('\n')
				.filter(line => line.trim() !== '').length // Фильтруем пустые строки и подсчитываем количество оставшихся
			numberOfCitiesElement.textContent = lines
		}

		// обновляем счетчик строк при вводе
		selectedCity.addEventListener('input', updateNumberOfCities)

		// обновляем счетчик строк при загрузке страницы
		updateNumberOfCities()
	}

	// Функция для поля IgmAlt
	function showIgmAltField() {
		const btnAddImgAlt = document.querySelector('#btnAddImgAlt'),
			wrapperListOfAltTags = document.querySelector('.wrapperListOfAltTags')

		if (btnAddImgAlt) {
			btnAddImgAlt.addEventListener('click', function () {
				const imgsAlt = document.querySelectorAll('img[alt]'),
					listOfAltTags = document.querySelector('.listOfAltTags'),
					numberOfImages = document.querySelector('.numberOfImages')

				if (numberOfImages.textContent == '') {
					numberOfImages.textContent = imgsAlt.length
					imgsAlt.forEach(img => {
						if (img.alt.length < 10) return // Если длина alt меньше 10 символов не показывать их
						const div = document.createElement('div') // Создаем див
						div.classList.add('imgOfAltTagWrapper') // добавляем класс

						const inp = document.createElement('input') // Создаем инпут
						inp.classList.add('inpOfAltTag') // добавляем класс
						inp.type = 'text' // тип
						inp.name = 'inpOfAltTagName' // имя
						inp.value = img.alt // добавляем в инпут значение img alt

						const imgCopy = img.cloneNode(true) // создаем копии изображений
						imgCopy.classList.add('imgOfAltTag') // получаем каждую картинку

						div.appendChild(imgCopy) // вставляем его img в созданный див
						div.appendChild(inp) // вставляем его inp в созданный див

						listOfAltTags.appendChild(div) // див вставляем в основную обертку
					})
				}

				wrapperListOfAltTags.classList.toggle('active') // показать форму
			})
		}
	}
	// Функция для отправлки картинок на сервер
	function createsAnObjectWithPicturesAndInputValue() {
		let imgInputPairs = {} // Создаем пустой объект
		// Находим все div, содержащие изображения и поля ввода
		let listOfAltTagsDivs = document.querySelectorAll('.imgOfAltTagWrapper')

		listOfAltTagsDivs.forEach(div => {
			// Находим изображение и поле ввода внутри каждого div
			let img = div.querySelector('img'),
				input = div.querySelector('input')

			img = `../assets/img/${img.src.split('/').pop()}` // обрезаем src img

			// Добавляем пару в объект или Map
			// Используем src изображения как ключ, и значение input как значение
			if (input.value != '') {
				imgInputPairs[img] = input.value
			}
		})

		// Если в объект пуст возврашаем null
		if (Object.keys(imgInputPairs).length === 0) {
			return null
		}
		return imgInputPairs
	}

	// Функция для показа формы Strong
	function showFormStrong() {
		const btnAddStrong = document.querySelector('#btnAddStrong'),
			wrapperListOfStrong = document.querySelector('.wrapperListOfStrong')

		if (btnAddStrong) {
			btnAddStrong.addEventListener('click', function () {
				wrapperListOfStrong.classList.toggle('active')
				singleRequest.initiateWebSocket()
				// При клике на кнопку стронг удаляем форму логов
				const displayBlockLogs = document.querySelector('.displayBlockLogs')
				if(displayBlockLogs){
					displayBlockLogs.remove()
				}

			})
		}
	}
	// Функция для подсчета количество введенных Strong
	function numberOfStrong() {
		const selectedStrong = document.querySelector('.listOfStrong')
		const numberOfStrongElement = document.querySelector('.numberOfStrong')

		function updateNumberOfStrong() {
			// Убираем пробелы и переносы строк в начале и конце,
			// не затрагивая пробелы и переносы строк в середине текста.
			const cleanedValue = selectedStrong.value.replace(/^\s+|\s+$/g, '')

			const lines = cleanedValue
				.split('\n')
				.filter(line => line.trim() !== '').length // Фильтруем пустые строки и подсчитываем количество оставшихся
			numberOfStrongElement.textContent = lines
		}

		// обновляем счетчик строк при вводе
		selectedStrong.addEventListener('input', updateNumberOfStrong)

		// обновляем счетчик строк при загрузке страницы
		updateNumberOfStrong()
	}
	// Отправляет все ключи слова Strong на сервер
	function sendsAllStrongWordKeysToTheServer() {
		const listOfStrong = document.querySelector('.listOfStrong')

		return listOfStrong.value
	}

	// Функция для показа формы Capital
	function showFormCapital() {
		const btnAddCapital = document.querySelector('#btnAddCapital'),
			wrapperListOfCapital = document.querySelector('.wrapperListOfCapital')

		if (btnAddCapital) {
			btnAddCapital.addEventListener('click', function () {
				wrapperListOfCapital.classList.toggle('active')
			})
		}
	}
	// Функция для подсчета количество введенных Capital
	function numberOfCapital() {
		const selectedStrong = document.querySelector('.listOfCapital')
		const numberOfStrongElement = document.querySelector('.numberOfCapital')

		function updateNumberOfCapital() {
			// Убираем пробелы и переносы строк в начале и конце,
			// не затрагивая пробелы и переносы строк в середине текста.
			const cleanedValue = selectedStrong.value.replace(/^\s+|\s+$/g, '')

			const lines = cleanedValue
				.split('\n')
				.filter(line => line.trim() !== '').length // Фильтруем пустые строки и подсчитываем количество оставшихся
			numberOfStrongElement.textContent = lines
		}

		// обновляем счетчик строк при вводе
		selectedStrong.addEventListener('input', updateNumberOfCapital)

		// обновляем счетчик строк при загрузке страницы
		updateNumberOfCapital()
	}
	// Отправляет все ключи слова Capital на сервер
	function sendsAllCapitalWordKeysToTheServer() {
		const listOfStrong = document.querySelector('.listOfCapital')

		return listOfStrong.value
	}

	// Функция для показа формы TitleSuffix
	function showFormTitleSuffix() {
		const btnAddTitleSuffix = document.querySelector('#btnAddTitleSuffix'),
			wrapperListOfTitleSuffix = document.querySelector(
				'.wrapperListOfTitleSuffix'
			)

		if (btnAddTitleSuffix) {
			btnAddTitleSuffix.addEventListener('click', function () {
				wrapperListOfTitleSuffix.classList.toggle('active')
			})
		}
	}
	// Функция для подсчета количество введенных TitleSuffix
	function numberOfTitleSuffix() {
		const listOfTitleSuffix = document.querySelector('.listOfTitleSuffix'),
			numberOfTitleSuffixCounter = document.querySelector(
				'.numberOfTitleSuffixCounter'
			)

		listOfTitleSuffix.addEventListener('input', () => {
			numberOfTitleSuffixCounter.textContent = listOfTitleSuffix.value.length
		})
	}
	// Отправляет Title Suffix на сервер
	function sendsTitleSuffixToTheServer() {
		const listOfStrong = document.querySelector('.listOfTitleSuffix')

		return listOfStrong.value
	}

	// Функция для показа формы Link
	function showFormLink() {
		const btnAddLink = document.querySelector('#btnAddLink'),
			wrapperListOfLink = document.querySelector('.wrapperListOfLink')

		if (btnAddLink) {
			btnAddLink.addEventListener('click', function () {
				wrapperListOfLink.classList.toggle('active')
			})
		}
	}
	// Отправляет все ключи слова Link на сервер
	function sendsAllLinksToTheServer() {
		const firsPartText = document.querySelector('.firsPartText__link').value,
			secondPartText = document.querySelector('.secondPartText__link').value,
			insertedLink = document.querySelector('.insertedLink__link').value

		const dataForms = {
			firsPartText: firsPartText,
			secondPartText: secondPartText,
			insertedLink: insertedLink,
		}

		jsonDataForms = JSON.stringify(dataForms)

		return jsonDataForms
	}

	// Функция для показа формы ReplaceAll
	function showFormReplaceAll() {
		const btnReplaceAll = document.querySelector('#btnReplaceAll'),
		wrapperListOfReplaceAll = document.querySelector('.wrapperListOfReplaceAll')

		if (btnReplaceAll) {
			btnReplaceAll.addEventListener('click', function () {
				wrapperListOfReplaceAll.classList.toggle('active')
			})
		}
	}

	// Функция для показа формы ReplacePage
	function showFormReplacePage() {
		const btnReplacePage = document.querySelector('#btnReplacePage'),
		wrapperListOfReplacePage = document.querySelector('.wrapperListOfReplacePage')

		if (btnReplacePage) {
			btnReplacePage.addEventListener('click', function () {
				wrapperListOfReplacePage.classList.toggle('active')
				singleRequest.initiateWebSocket()
				// При клике на кнопку стронг удаляем форму логов
				const displayBlockLogs = document.querySelector('.displayBlockLogs')
				if(displayBlockLogs){
					displayBlockLogs.remove()
				}
			})
		}
	}

	// Функция для показа формы Analysis
	function showFormAnalysise() {
		const btnAnalysis = document.querySelector('#btnAnalysis'),
		wrapperListOfAnalysis = document.querySelector('.wrapperListOfAnalysis')

		if (btnAnalysis) {
			btnAnalysis.addEventListener('click', function () {
				wrapperListOfAnalysis.classList.toggle('active')
				// Активируем Websocket для анализа страниц
				singleRequest.analysis.getInitiateWebSocketAnalysis()
			})
		}
	}
			
	// Обработчик для кнопок фильтрации
	document.body.addEventListener('click', function () {
		document.querySelectorAll('.exclusionButtons').forEach(button => {
			button.addEventListener('click', handlerForFilterButtons)
		})
	})

	let btnFilterBoolArr = [true, true, true]

	function handlerForFilterButtons(e) {
		const btnQuotes = document.querySelector('#btnQuotes'),
			btnColon = document.querySelector('#btnColon'),
			btnHyphen = document.querySelector('#btnHyphen')

		if (e.target.classList.contains('exclusionButtons')) {
			e.target.classList.toggle('activeBtn')

			btnFilterBoolArr[0] = btnQuotes.classList.contains('activeBtn')
			btnFilterBoolArr[1] = btnColon.classList.contains('activeBtn')
			btnFilterBoolArr[2] = btnHyphen.classList.contains('activeBtn')
		}

		return btnFilterBoolArr
	}

	// Поиск страниц
	function searchPages() {
		// Получаем элемент поля ввода поиска по классу
		const searchField = document.querySelector('.searchPages');
		// Инициализируем переменную для хранения идентификатора таймера задержки
		let timeout = null;
	
		// Проверяем, существует ли поле ввода на странице
		if (searchField) {
			// Объявление переменной Получаем все элементы страниц для поиска по селектору
			let allPages = ""

			// Назначаем обработчик события на каждый ввод в поле поиска
			searchField.oninput = function() {
				// Очищаем предыдущий таймер задержки, если таковой был установлен
				clearTimeout(timeout);
	
				// Устанавливаем новый таймер задержки
				timeout = setTimeout(() => {
					// Получаем значение из поля ввода, удаляем пробелы с обеих сторон и переводим в верхний регистр
					let val = this.value.trim().toUpperCase();
	
					// Проверяем, не пустое ли значение введено
					if (val !== '') {
						// Получаем все элементы страниц для поиска по селектору
						allPages = document.querySelectorAll('.pages_list .pages_list_item .pageWrapper a');
						// Инициализируем переменную для хранения первого найденного элемента
						let firstFound = null;
	
						// Перебираем все элементы страниц
						allPages.forEach(elem => {
							// Получаем текст элемента, приводим к верхнему регистру
							const text = elem.textContent.toUpperCase();
	
							// Проверяем, содержит ли текст искомое значение
							if (text.includes(val)) {
								// Если это первое найденное совпадение, сохраняем элемент
								if (!firstFound) firstFound = elem;
								// Выделяем найденное совпадение с помощью функции insertMark
								const index = text.indexOf(val);
								elem.innerHTML = insertMark(elem.textContent, index, val.length);
							} else {
								// Если совпадений нет, возвращаем исходный текст элемента
								elem.innerHTML = elem.textContent;
							}
						});
	
						// Если нашли хотя бы одно совпадение, прокручиваем страницу до первого найденного элемента
						if (firstFound) firstFound.scrollIntoView({ behavior: 'smooth', block: 'start' });
					} else {
						// Если строка поиска пуста, сбрасываем выделение для всех элементов
						allPages.forEach(elem => {
							elem.innerHTML = elem.textContent;
						});
					}
				}, 500); // Задаем задержку в 500 миллисекунд
			};
		}
	}
	
	// Вспомогательная функция для формы поиска страниц подсвечивает буквы
	function insertMark(string, pos, len) {
		return (
			string.slice(0, pos) +
			'<mark>' +
			string.slice(pos, pos + len) +
			'</mark>' +
			string.slice(pos + len)
		)
	}

	// Закрывает окно Logs
	function closeWindowLogs() {
		const btnCloseWindow = document.querySelector('#closeWindow'),
			jqueryLogsMenu = document.querySelector('.jquery-logs-menu')
		btnCloseWindow.addEventListener('click', () => {
			jqueryLogsMenu.classList.toggle('active')
		})
	}

	//----Модули
	window.modul = {
		queryToGPT,
		updateCharacterCount,
		showPagesInPageBlockPlagin,
		numberOfCities,
		numberOfStrong,
		numberOfCapital,
		numberOfTitleSuffix,
		initiateWebSocket,
		deleteAllPage,
		addLangSite,
		updateWhenPrinting,
		showIgmAltField,
		showFormStrong,
		showFormCapital,
		showFormTitleSuffix,
		showFormLink,
		showFormReplaceAll,
		showFormReplacePage,
		showFormAnalysise,
		createsAnObjectWithPicturesAndInputValue,
		handlerForFilterButtons, // Обработчик для кнопок фильтрации
		searchPages, // Поиск страниц
		closeWindowLogs, // Закрытие окна Logs
	}
})()

// Клики на кнопки
document.addEventListener('click', e => {
	if (e.target.matches('.btnFormStrong')) {
		singleRequest.makesTextBold()
	} else if (e.target.matches('.btnFormCapital')) {
		singleRequest.makesTextCapital()
	} else if (e.target.matches('.btnFormImg')) {
		singleRequest.changesAltTagsOfImages()
	} else if (e.target.matches('.btnFormTitleSuffix')) {
		singleRequest.addTitleSuffix()
	} else if (e.target.matches('.btnFormLink')) {
		singleRequest.addLink()
	} else if (e.target.matches('.btnFormReplaceAll')){
		singleRequest.replaceAll()
	} else if (e.target.matches('.btnFormReplacePage')){
		try{
			singleRequest.replacePage.getReplacePage()
		}catch (error) {
			console.log("Исключительная ситуация обработана: " , error)
		}
	} else if (e.target.matches('.btnFormAnalysis')) {
		try{
			singleRequest.analysis.getAnalysis()
		}catch (error) {
			console.log("Исключительная ситуация обработана: ", error)
		}
	} else if (e.target.matches('.btnFormAnalysisClear')){
		singleRequest.analysis.getAnalysisClear() // Очитска формы анализа
	} else if (e.target.matches('.btnFormAnalysisStop')) {
		singleRequest.analysis.getAnalysisStop() // Стоп Анализ
	}
})



!(function () {

	// Получаем текущий url
	var baseUrl = window.location.origin // Начальный домен, например "https://example.com"
	var url = window.location.href // Получаем текущий URL
	var parts = url.split('/')
	var index = parts.indexOf('sites')
	if (index !== -1 && parts.length > index + 2) {
		var region = parts[index + 1]
		var service = parts[index + 2]
	}

	// Функция спиннер
	function spinner(spinner) {
		document.getElementById('stopButton').style.display = 'none'
		document.querySelector('.spinnerLogsTime').style.display = 'none'

		if (spinner) {
			document.getElementById('spinner').style.display = 'block'
			document.body.classList.add('darkFon')
		} else {
			document.getElementById('spinner').style.display = 'none'
			document.body.classList.remove('darkFon')
		}
	}

	//Делает текст жирным
	function makesTextBold() {
		const valueListOfStrong = document.querySelector('.listOfStrong').value

		let valueListOfStrongTrim = valueListOfStrong.trim() // Убираем пробелы

		// Если поле не пустое выполниться
		if (valueListOfStrongTrim) {
			// Отображение индикатора загрузки и установка темного фона во время обработки запроса
			spinner(true)
			
			// Блок с прочими логами
			logsOther()
			
			// Объект с данными
			const data = {
				valueListOfStrongTrim: valueListOfStrongTrim, // Ключевые слова
				region: region, // регион н-р at
				service: service, // название сайта н-р test
			}
			const jsonData = JSON.stringify(data)

			// Отправить запрос на сервер
			fetch('/singlerequestmakestextbold', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json', // Тип контента - JSON
				},
				body: jsonData, // Отправляем JSON
			})
				.then(response => {
					if (!response.ok) {
						// Скрыть индикатора загрузки и темного фона во время обработки запроса
						// spinner(false)
						throw new Error('Ошибка запроса' + response.statusText)
					}
					// return response.json() // Возвращаем если это необходимо

					// Скрыть индикатора загрузки и темного фона во время обработки запроса
					// spinner(false)
				})
				.then(data => {
					// Дополнительная обработка полученных данных
				})
				.catch(error => {
					console.log(
						'Что-то пошло не так при отправке данных на сервер в функции makesTextBold: ',
						error
					)
				}).finally(() => {
					sendNewRequest()
					// spinner(false)
				})
		}
	}

	window.isNewRequest = false // глобальная переменная для отслеживания нового запроса
	
	// Блок Прочих Логов
	function logsOther(){
		const displayBlockLogs = document.querySelector('.displayBlockLogs');
		displayBlockLogs ? displayBlockLogs.remove() : undefined; // Если блок уже есть то удаляем его и создаем новый

		const addFormOtherLogs = `
		<div class="wrapperListOfStrong displayBlockLogs">
			<div class="headeR">
				Logs <span class="numberOfStrong"><!-- Количество Strong --></span>
				<div id="hide_menu">–</div>
			</div>
			<div class="jquery-menu">
				<div class="logsOther"></div>
			</div>
		</div>
		`
		document.body.insertAdjacentHTML('afterbegin', addFormOtherLogs);
	}

	// Функция для создания Вебсокит соединения LOGS
	function initiateWebSocket() {
		// Указывает, используется ли безопасное соединение
		const isSecure = window.location.protocol === 'https:'

		// Получает имя хоста динамически
		const hostName = window.location.hostname
		
		// Получение порта из URL, если он предоставлен, иначе используется порт по умолчанию 8080
		const port = window.location.port || '8080'

		// Устанавливает протокол в зависимости от того, является ли соединение безопасным
		const protocol = isSecure ? 'wss' : 'ws'
		console.log(protocol, hostName, port)

		// Если сокет уже открыт или открывается, не создаем новый
		// if (window.socket && window.socket.readyState !== WebSocket.CLOSED) {
		// 	return
		// }

		// Динамически создает URL веб-сокета
		if(hostName == "localhost"){
			window.socket = new WebSocket(`${protocol}://${hostName}:8080/ws-endpointotherlogs`) //lock
		}else {
			window.socket = new WebSocket(`${protocol}://${hostName}/ws-endpointotherlogs`); //web
		}

		window.socket.addEventListener('open', event => {
			console.log('Открытие веб-сокета:', event)
		})

		window.socket.addEventListener('error', event => {
			console.error('Ошибка веб-сокета:', event)
		})

		window.socket.addEventListener('message', event => {
			const logsList = document.querySelector('.logsOther')
			if (logsList) {
				if (window.isNewRequest) {
					logsList.innerHTML = '' // Используйте внутренний HTML вместо значения
					window.isNewRequest = false
				}

				// Контролируем количество одновременных показываемых записей чтобы не было кряша браузера
				let numberElementsShown = logsList.textContent.split('\n').length
				if(numberElementsShown <= 20){
					logsList.innerHTML += "<p class='logsOtherData'>" + event.data + "</p>" // Добавление разрыва строки с помощью <br>
				}else {
					// Добавьте новый HTML-контент. Убедитесь, что он очищен, чтобы предотвратить XSS-атаки.
					logsList.innerHTML = "<p class='logsOtherData'>" + event.data + "</p>" // Добавление разрыва строки с помощью <br>
				}

				// Автоматическая прокрутка вниз
				logsList.scrollTop = logsList.scrollHeight
			} else {
				console.error('Log container not found!')
			}

			// Убераем Спиннер
			if(event.data == "FINISH"){
				let logsOtherData = document.querySelectorAll('.logsOtherData')
				logsOtherData.forEach(error => {
					if(error.textContent == "FINISH"){
						error.classList.add("finish")
					}
				})
				spinner(false)
			} else if (event.data == "ERROR"){
				// Если произошла ошибка выводим его красным
				let logsOtherData = document.querySelectorAll('.logsOtherData')
				logsOtherData.forEach(error => {
					if(error.textContent == "ERROR"){
						error.classList.add("error")
					}
				})

				spinner(false)
			}
		})


		window.socket.addEventListener('close', event => {
			console.log('Вебсокет закрыт:', event)

			// Переподключение через 1 секунд после закрытия
			setTimeout(initiateWebSocket, 1)
		})
	}

	// Функция для отправки нового запроса вебсокет
	function sendNewRequest() {
		window.isNewRequest = true // установите этот флаг перед отправкой нового запроса
		// ваш код для отправки нового запроса через WebSocket
		if (window.socket && window.socket.readyState === WebSocket.OPEN) {
			// window.socket.send("Your new request data here");
		}
	}

	// Делает текст с Заглавным
	function makesTextCapital() {
		const listOfCapital = document.querySelector('.listOfCapital').value

		let valueListOfCapitalTrim = listOfCapital.trim() // Убираем пробелы

		// Если условие истина выполниться
		if (valueListOfCapitalTrim) {
			// Отображение индикатора загрузки и установка темного фона во время обработки запроса
			spinner(true)

			// Объект с данными
			const data = {
				valueListOfCapitalTrim: valueListOfCapitalTrim, // Ключевые слова
				region: region, // регион н-р at
				service: service, // название сайта н-р test
			}
			const jsonData = JSON.stringify(data)

			// Отправить запрос на сервер
			fetch('/singlerequestmakestextcapital', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json', // Тип контента - JSON
				},
				body: jsonData,
			})
				.then(response => {
					if (!response.ok) {
						// Скрыть индикатора загрузки и темного фона во время обработки запроса
						spinner(false)
						throw new Error('Ошибка запроса' + response.statusText)
					}
					// Скрыть индикатора загрузки и темного фона во время обработки запроса
					spinner(false)
				})
				.catch(error => {
					console.log(
						'Что-то пошло не так при отправке данных на сервер в функции makesTextCapital: ',
						error
					)
				})
		}
	}

	// Добавляет к Title Suffix
	function addTitleSuffix() {
		const listOfTitleSuffix = document.querySelector('.listOfTitleSuffix').value

		let listOfTitleSuffixTrim = listOfTitleSuffix.trim() // Убираем пробелы

		// Если поле не пустое то выполниться
		if (listOfTitleSuffixTrim) {
			spinner(true) // Активируем спиннер

			// Создаем объект данных
			let data = {
				listOfTitleSuffixTrim: listOfTitleSuffixTrim,
				region: region,
				service: service,
			}

			let dataJson = JSON.stringify(data) // Создаем JSON

			// Отправить запрос на сервер
			fetch('/singlerequestaddtitlesuffix', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json', // Тип контента - JSON
				},
				body: dataJson,
			})
				.then(response => {
					if (!response.ok) {
						spinner(false)
						throw new Error('Ошибка запроса' + response.statusText)
					}
					spinner(false)
				})
				.catch(error => {
					spinner(false) // Отключить спиннер
					console.log('Что-то пошло не так при отправке данных на сервер в функции addTitleSuffix: ', error)
				})
		}
	}

	// Добавляет ссылки асинхронного кода
	async function addLink() {
		const firsPartText = document.querySelector('.firsPartText__link').value,
			secondPartText = document.querySelector('.secondPartText__link').value,
			insertedLink = document.querySelector('.insertedLink__link').value

		// Убираем пробелы
		let firsPartTextTrim = firsPartText.trim(),
			secondPartTextTrim = secondPartText.trim(),
			insertedLinkTrim = insertedLink.trim()

		// Если одно из полей истина
		if (firsPartTextTrim || secondPartTextTrim) {
			spinner(true) // Активируем спиннер
			// Создаем объект
			const dataForms = {
				firsPartText: firsPartTextTrim,
				secondPartText: secondPartTextTrim,
				insertedLink: insertedLinkTrim,
			}

			let jsonDataForms = JSON.stringify(dataForms)

			const data = {
				dataForms: jsonDataForms,
				region: region,
				service: service,
			}

			// Делаем json
			let jsonData = JSON.stringify(data)

			// Оборачиваем  для обработки исключений
			try {
				let response = await fetch('/singlerequestaddlinks', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json', // Тип контента - JSON
					},
					body: jsonData,
				})

				// При получении плохого ответа
				if (!response.ok) {
					spinner(false) // Убираем спиннер
					throw new Error('Ошибка запроса' + response.statusText)
				}

				spinner(false) // Убираем спиннер
			} catch (error) {
				spinner(false) // Убираем спиннер
				console.log(
					'Что-то пошло не так при отправке данных на сервер в функции addLink: ',
					error
				)
			}
		}
	}

	// Меняет alt теги картинок
	function changesAltTagsOfImages() {
		const objectWithImgAndInputValues =
			modul.createsAnObjectWithPicturesAndInputValue() //объект со значениями имг и инпута

		// Проверяем объект на пустоту
		if (Object.keys(objectWithImgAndInputValues).length !== 0) {
			spinner(true) // Активируем спиннер
			let objectWithImgAndInputValuesJson = JSON.stringify(
				objectWithImgAndInputValues // Переобразуем объект в json
			)
			// Объект необходимых данных
			let data = {
				objectJsonImg: objectWithImgAndInputValuesJson,
				region: region,
				service: service,
			}

			const objectJsonImg = JSON.stringify(data) // Переобразуем в json для отправки на сервер

			fetch('/singlerequestchangesalttagsofimages', {
				method: 'POST', // Метод запроса
				headers: {
					'Content-Type': 'application/json', // Тип контента - JSON
				},
				body: objectJsonImg,
			})
				.then(response => {
					if (!response.ok) {
						spinner(false) // Убираем спиннер
						throw new Error('Ошибка запроса' + response.statusText)
					}
					spinner(false) // Убираем спиннер
				})
				.catch(error => {
					console.log('Что-то пошло не так при обработке картинок: ', error)
				})
		}
	}

	// Заменить слово ReplaceAll
	function replaceAll(){
		const firstText = document.querySelector('.inpFirstText').value,
			secondText = document.querySelector('.inpSecondText').value;

			// Убираем пробелы
		const firstTextTrim = firstText.trim(),
			secondTextTrim = secondText.trim();

			// Если поле не пустое то выполниться
		if(firstTextTrim) {
			spinner(true) // Активируем спиннер

			// Создаем объект данных
			const data = {
				firstTextTrim: firstTextTrim,
				secondTextTrim: secondTextTrim,
				region: region,
				service: service
			}

			const jsonData = JSON.stringify(data)// Создаем JSON
			
			// Отправить запрос на сервер
			fetch('/replaceallhandler', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json', // Тип контента - JSON
				},
				body: jsonData
			}).then(response => {
				if(!response.ok){
					spinner(false) // Отключить спиннер
					throw new Error("Ошибка при отправке запроса на сервер " + response.statusText)
				}
				spinner(false) // Отключить спиннер
			}).catch(error => {
				spinner(false) // Отключить спиннер
				console.log('Что-то пошло не так при отправке данных на сервер в функции replaceAllHandler: ', error)
			})
		}
	}

	// Заменить название города на определенных страница на другое название города и ReplacePage
	class ReplacePage {
		firstText;
		secondText;
		prefixUrl;
		region;
		service;

		constructor(firstText, secondText, prefixUrl, region, service){
			this.firstText = firstText
			this.secondText = secondText
			this.region = region
			this.service = service
			this.prefixUrl = prefixUrl
		}

		getReplacePage(){
			let firstInpText = document.querySelector(this.firstText),
			secondInpText = document.querySelector(this.secondText),
			prefixInpUrl = document.querySelector(this.prefixUrl);
			try{
				firstInpText = firstInpText.value;
				secondInpText = secondInpText.value;
				prefixInpUrl = prefixInpUrl.value;
			}catch (error) {
				throw new Error("Ошибка при доступке к Dom елементам: " + error)
			}


			const firstInpTextTrim = firstInpText.trim(),
				secondInpTextTrim = secondInpText.trim(),
				prefixInpUrlTrim = prefixInpUrl.trim();

			if(firstInpTextTrim && secondInpTextTrim){
				spinner(true) // Активируем спиннер

				// Блок с прочими логами
				logsOther()

				const data = {
					firstInpTextTrim: firstInpTextTrim,
					secondInpTextTrim: secondInpTextTrim,
					prefixInpUrlTrim: prefixInpUrlTrim,
					region: this.region,
					service: this.service
				}

				const jsonData = JSON.stringify(data)// Создаем JSON

				this.getFetch(jsonData)
		
			}
		}
		getFetch(jsonData){
			fetch('/replacepagehandler', {
				method: "POST",
				headers: {
					'Content-Type': 'application/json', // Тип контента - JSON
				},
				body: jsonData,
			}).then(response => {
				if(!response.ok) {
					throw new Error("Ошибка при отправке запроса на сервер " + response.statusText)
				}
			}).catch(error => {
				console.log('Что-то пошло не так при отправке данных на сервер в функции replacepagehandler: ', error)
			}).finally(() => {
				sendNewRequest()
				spinner(false)// Отключаем спиннер в любом случае
			})
		}
	}
	const replacePage  = new ReplacePage(".inpFirstTextReplacePage",".inpSecondTextReplacePage", ".inpPrefixUrlReplacePage", region, service)

	// Делает анализ страниц сайта Analysis
	window.isNewRequest = false // глобальная переменная для отслеживания нового запроса
	
	class Analysis {
		region;
		nameSite;
		indexCheckbox;
		analysisLogs;
		numberOfPagesWithErrors; // Количество страниц с ошибками
		enableLink; // Значения чекбокса для ссылок
		analysisLogsLink; // Название страницы с Ошибками

		constructor(region,nameSite, indexCheckbox, analysisLogs, numberOfPagesWithErrors, enableLink, analysisLogsLink) {
			this.region = region
			this.nameSite = nameSite
			this.indexCheckbox = indexCheckbox
			this.analysisLogs = analysisLogs
			this.numberOfPagesWithErrors = numberOfPagesWithErrors
			this.enableLink = enableLink
			this.analysisLogsLink = analysisLogsLink
		}

		getAnalysis() {
			const indexCheckbox = document.querySelector(this.indexCheckbox),
				enableLink = document.querySelector(this.enableLink);

			let check = false,
				linkCheck = false;
			try{
				if(indexCheckbox.checked){
					check = true //Если чек поставлен делаем его true
				}
				spinner(true) // Активируем спиннер
			}catch (errot) {
				throw new Error("Ошибка при доступке к Dom елементам: indexCheckbox")
			}

			try {
				if(enableLink.checked){
					linkCheck = true
				}
				spinner(true) // Активируем спиннер
			} catch (error) {
				throw new Error("Ошибка при доступке к Dom елементам: enableLink")
			}


			
			const data = {
				region: this.region,
				nameSite: this.nameSite,
				indexCheckbox: check,
				url: url,
				linkCheck: linkCheck,
			}
			const jsonData = JSON.stringify(data) // Переобразовываем в json

			this.getFetch(jsonData)
		}

		getFetch(jsonData){

			fetch('/analysishandler', {
				method: "POST",
				headers: {
					'Content-Type': 'application/json', // Тип контента - JSON
				},
				body: jsonData
			}).then(response => {
				if(!response.ok){
					throw new Error("Ошибка при отправке запроса на сервер " + response.statusText)
				}
			}).catch(error => {
				console.log('Что-то пошло не так при отправке данных на сервер в функции analysishandler: ', error)
			}).finally(() => {
				spinner(false)
			})
			this.getSendNewRequestAnalysis() // Инициализация нового запроса websocket

		}

		getInitiateWebSocketAnalysis(){
			// Указывает, используется ли безопасное соединение
			const isSecure = window.location.protocol === 'https:'

			// Получает имя хоста динамически
			const hostName = window.location.hostname
			
			// Получение порта из URL, если он предоставлен, иначе используется порт по умолчанию 8080
			const port = window.location.port || '8080'

			// Устанавливает протокол в зависимости от того, является ли соединение безопасным
			const protocol = isSecure ? 'wss' : 'ws'
			console.log(protocol, hostName, port)

			// Закрыть сокет ws-endpointanalysis, если он открыт и есть идентификатор
			if (window.socket && window.socket.endpointType === 'analysis') {
				// Закрыть сокет ws-endpointanalysis, если он открыт
				if (window.socket.readyState === WebSocket.OPEN) {
					window.socket.close();
				}
			}

			// Динамически создает URL веб-сокета
			if(hostName == "localhost"){
				window.socket = new WebSocket(`${protocol}://${hostName}:8080/ws-endpointanalysis`) //lock
				window.socket.endpointType = 'analysis'; // Установка идентификатора сокета по этому индентификатору можно обрашаться к конкретному сокету

			}else {
				window.socket = new WebSocket(`${protocol}://${hostName}/ws-endpointanalysis`); //web
				window.socket.endpointType = 'analysis'; // Установка идентификатора сокета по этому индентификатору можно обрашаться к конкретному сокету
			}

			window.socket.addEventListener('open', event => {
				console.log('Открытие веб-сокета:', event)
			})
		
			window.socket.addEventListener('error', event => {
				console.error('Ошибка веб-сокета:', event)
			})

			// let flage = false // Флаг который аварийно завершает ws
			window.socket.addEventListener('message', event => {
				const analysisLogs = document.querySelector(this.analysisLogs);
				if (analysisLogs) {
					if (window.isNewRequest) {
						analysisLogs.innerHTML = '' // Используйте внутренний HTML вместо значения
						window.isNewRequest = false
					}

					//test
					// console.log(event.data)
					// Получаем и выводим на страницу данные из сервера полученные через WS
					try{
						let obj = JSON.parse(event.data) // Распарсим json
						
						const divPageError = document.createElement('div') // Создаем div контайнер

						// Проверяем есть ли какая либа ошибка
						if(obj.title != "" || obj.description != "" || obj.h1 != ""){

							if(obj.namePage == "404.html" || obj.namePage == "sitemap.html"){
								return // Не выводим эти страницы
							}

							divPageError.className = "analysisLogsPageError" // Добавляем класс для контайнера
							analysisLogs.appendChild(divPageError)

							if(obj.namePage == 'index.html'){
								divPageError.innerHTML += `<a class="analysisLogsLink flush__edit" href='./' target='_blank'>${obj.namePage}</a><br>`
							}else {
								divPageError.innerHTML += `<a class="analysisLogsLink flush__edit" href='pages/${obj.namePage}' target='_blank'>${obj.namePage}</a><br>`
							}
						}

						// Проверяем ошибка на Title
						if(obj.title != ""){
							divPageError.innerHTML += `<p class="analysisLogsError"> Некорректная длина Title ${obj.title.length} символов: ${obj.title}  </p>`
							divPageError.innerHTML += `<p class="analysisLogsRecomended"> Рекомендуемая длина Title 45-80 символов с пробелами </p>`
						}

						// Проверяем ошибка на Description
						if(obj.description != "") {
							divPageError.innerHTML += `<p class="analysisLogsError"> Некорректная длина Description ${this.getLengthWithoutSpaces(obj.description)} символов: ${obj.description}  </p>`
							divPageError.innerHTML += `<p class="analysisLogsRecomended"> Рекомендуемая длина Description 160-290 символов без пробелов </p>`
						}

						// Проверяем ошибка на H1
						if(obj.h1 != "") {
							divPageError.innerHTML += `<p class="analysisLogsError"> Некорректная длина h1 ${obj.h1.length} символов: ${obj.h1}  </p>`
							divPageError.innerHTML += `<p class="analysisLogsRecomended"> Рекомендуемая длина h1 20-70 символов с пробелами </p>`
						}

						// Сравнение H1 и Title
						if(obj.duplicatesH1Title != ""){
							divPageError.innerHTML += `<p class="analysisLogsError"> Title дублирует H1: ${obj.duplicatesH1Title} : ${obj.duplicatesH1Title} </p>`
							divPageError.innerHTML += `<p class="analysisLogsRecomended"> Рекомендуем дополнить Title текущая длина ${obj.duplicatesH1Title.length} символов, рекомендуемая длина 45-80 символов с пробелами </p>`
						}

						// Проверяем на кириллицу
						if(obj.cyrillic != ""){
							divPageError.innerHTML += `<p class="analysisLogsError"> Найдено слово на кириллице: ${obj.cyrillic} </p>`
						}

						// Проверяем битые ссылки
						if(obj.allLinks != ""){
							divPageError.innerHTML += `<p class="analysisLogsError"> Найдена битая ссылка: <a href='${obj.allLinks}' target='_blank'>${obj.allLinks}</a> </p>`
						}


						//Количество страниц с ошибками
						const numberOfPagesWithErrors = document.querySelectorAll('.analysisLogsPageError').length
						this.getNumberOfPagesWithErrors(numberOfPagesWithErrors)

						// // Если получить повторно название страницы то ws аварийно завершится
						// if(this.getNamePageError() == obj.namePage){
						// 	if(flage){
						// 		flage = false
						// 		 // Переинециилизируем ws ото приходится перезапускать вручную
						// 		this.getAnalysisStop()
						// 	} else{
						// 		flage = true
						// 	}
						// }


					}catch(error){
						console.log("Ошибка при разборе JSON:", error)
						spinner(false)
					}
	
					// Добавьте новый HTML-контент. Убедитесь, что он очищен, чтобы предотвратить XSS-атаки.
					// analysisLogs.innerHTML += event.data // Добавление разрыва строки с помощью <br>
		
					// Автоматическая прокрутка вниз
					// logsList.scrollTop = logsList.scrollHeight
				} else {
					console.error('Log container not found!')
				}
			})

			window.socket.addEventListener('close', event => {
				console.log('Вебсокет закрыт:', event)
		
				// Переподключение через 1 секунд после закрытия
				// setTimeout(this.getInitiateWebSocketAnalysis(), 30000)
			})
		}

		getSendNewRequestAnalysis(){ // Инициализация нового запроса
			window.isNewRequest = true // установите этот флаг перед отправкой нового запроса
			// ваш код для отправки нового запроса через WebSocket
			if (window.socket && window.socket.readyState === WebSocket.OPEN) {
				// window.socket.send("Your new request data here");
			}
		}

		getLengthWithoutSpaces(str){// Проверяет длину строки без пробелов, табуляций и переносов строк
			// Удаление пробелов, табуляций и переносов строк
    		var cleanedStr = str.replace(/\s/g, '');
    		return cleanedStr.length;
		}

		getAnalysisClear(){ // Очитска формы анализа
			const analysisLogs = document.querySelector(this.analysisLogs),
			numberOfPagesWithErrors = document.querySelector(`${this.numberOfPagesWithErrors} > span`);
			if(analysisLogs){
				analysisLogs.textContent = ""
				numberOfPagesWithErrors.textContent = 0
			}
		}

		getNumberOfPagesWithErrors(numberOfPagesWithErrors){ //Количество страниц с ошибками
			document.querySelector(`${this.numberOfPagesWithErrors} > span`).textContent = numberOfPagesWithErrors
		}

		getAnalysisStop(){ // Остановить Анализ
			if (window.socket && window.socket.readyState === WebSocket.OPEN) {
				window.socket.send('stop');
			}
			// this.getInitiateWebSocketAnalysis()
		}

		// getNamePageError(){ // Название страницы с ошибкой
		// 	const namePageErr = document.querySelector(this.analysisLogsLink)
		// 	if(namePageErr){
		// 		return namePageErr.textContent
		// 	}
		// }
	}

	const analysis = new Analysis(region, service, ".indexCheckAnalysis", ".analysisLogs", ".numberOfPagesWithErrors", ".enableLinkAnalysis", ".analysisLogsLink")

	
	

	window.singleRequest = {
		makesTextBold,
		makesTextCapital,
		changesAltTagsOfImages,
		addTitleSuffix,
		addLink,
		replaceAll,
		replacePage,
		analysis,
		initiateWebSocket,
	}
})()
