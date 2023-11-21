//http://localhost:8080/
// https://nubify.ru/
// Создаем XMLHttpRequest для чтения index.html
const xhr = new XMLHttpRequest();
xhr.open('GET', chrome.runtime.getURL('index.html'), true);

xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        const el = document.createElement('div');
        el.innerHTML = xhr.responseText;
        el.classList.add('mainElement')
        document.body.insertAdjacentElement('beforeend', el);
    }
}
xhr.send();

// при нажатии на кнопку добавить страницу
document.addEventListener("click", function (e) { 
    if (e.target.closest('#add_page')) {
        const menu = document.querySelector('.jquery-center-menu');
        menu.classList.toggle('active'); 
    }

    if (e.target.closest('#submit-buttonPlagin')) {
        const menu = document.querySelector('.jquery-logs-menu');
        menu.classList.add('active'); //не скрывать форму при повторном нажатии
    }
});

// активация при нажатии на кнопки Ctrl + Shift + Z
document.addEventListener('keyup', function (e) {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyZ') {
        const rightMenu = document.querySelector('.jquery-right-menu');
        const otherMenus = document.querySelectorAll('.jquery-center-menu, .jquery-logs-menu');
        // Переключение для .jquery-right-menu
        rightMenu.classList.toggle('active');

        if (rightMenu.classList.contains('active')) {
            // Если jquery-right-menu активен, то выполняем ваш код
            modul.showPagesInPageBlockPlagin();
            modul.numberOfCities();
            modul.deleteAllPage();
            modul.addLangSite();
            modul.updateWhenPrinting();
            document.querySelectorAll('.editable').forEach(addCheckbox);

            // Проверка наличия systemLogs и инициализация WebSocket, если еще не инициализировано
            const logsTextarea = document.getElementById('systemLogs');
            if (logsTextarea && (!window.socket || window.socket.readyState === WebSocket.CLOSED)) {
                modul.initiateWebSocket(); // вызов функции вебсокит
            }

        } else {
            // Если меню не активно, удаляем чекбоксы 
            removeCheckboxes();
        }

        // Для .jquery-center-menu и .jquery-logs-menu всегда удаляем класс 'active'
        otherMenus.forEach(menu => {
            menu.classList.remove('active');
        });
    }
});


// Определение пустого массива для хранения порядка флажков (чекбоксов).
let checkboxesOrder = [];

// Функция для поиска класса чекбокса в списке классов элемента.
function findCheckboxClass(element) {
    // Возвращает первый класс, который соответствует шаблону "checkbox_<число>" или null, если такого класса не найдено.
    return Array.from(element.classList).find(className => /^checkbox_\d+$/.test(className)) || null;
}

// Функция для добавления новой строки к каждой строке текста.
function appendNewlineToEachLine(text) {
    // Разбивает текст на строки, добавляет новую строку к каждой строке и возвращает объединенные строки.
    const lines = text.split('\n').map(line => line.trim() + '\n');
    return lines.join('');
}

// Функция для обновления выбранных чекбоксов.
function updateSelectedCheckboxes() {
    // Получает текст для каждого выбранного чекбокса и сохраняет его в массиве.
    const selectedTexts = checkboxesOrder
        .map(name => {
            const checkbox = document.querySelector(`.custom-checkbox[name="${name}"]`);
            if (checkbox && checkbox.checked) {
                return `[${checkbox.parentNode.innerText.trim()}]`;
            }
            return null;
        })
        .filter(Boolean);

    // Обновляет значение элемента с классом 'selected_checkboxes' выбранными текстами чекбоксов.
    document.querySelector('.selected_checkboxes').value = selectedTexts.join('\n\n') + '\n';
}

// Функция для добавления чекбокса к элементу.
function addCheckbox(element) {
    // Находит имя класса чекбокса или использует значение по умолчанию 'checkbox_0', если класс не найден.
    const checkboxClassName = findCheckboxClass(element);
    const checkboxName = checkboxClassName ? checkboxClassName : 'checkbox_0'; 

    // Проверяет, что элемент не является частью определенных меню и не содержит чекбокс.
    if (!element.closest('.jquery-right-menu') && !element.closest('.jquery-center-menu') && !element.querySelector('.custom-checkbox')) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'custom-checkbox';
        checkbox.name = checkboxName; 
        element.insertAdjacentElement('afterbegin', checkbox);

        // Добавляет обработчик события, который обновляет список выбранных чекбоксов и счетчик символов при изменении состояния чекбокса.
        checkbox.addEventListener('change', function () {
            if (this.checked && !checkboxesOrder.includes(this.name)) {
                checkboxesOrder.push(this.name);
            } else {
                checkboxesOrder = checkboxesOrder.filter(name => name !== this.name);
            }
            updateSelectedCheckboxes();
            modul.updateCharacterCount();
            updateSystemMessage(); // Обновляет длину символов в Системном сообщении для GPT
        });    
    }
}

// Функция для удаления чекбоксов
function removeCheckboxes() {
    document.querySelectorAll('.custom-checkbox').forEach(function (checkbox) {
        checkbox.remove();
    });
}

// Обновляет длину символов в Системном сообщении для GPT
function updateSystemMessage() {
    let textarea = document.getElementById('systemMessagePlagin');

    if (textarea) {
        let currentContent = textarea.value;

        // Формирование новой строки с обновленной длиной символов
        let updatedLengthString = `${modul.updateCharacterCount()}-${modul.updateCharacterCount() + 10}`;

        // Замена старой строки с длиной символов на новую
        let newContent = currentContent.replace(/\d+-\d+/, updatedLengthString);

        textarea.value = newContent;
    }
}

// свернуть развернуть меню при нажатии на кнопку
document.addEventListener("click", function (e) {
    if (e.target.id === 'hide_menu') {
        if (e.target.innerText === '+') {
            e.target.innerText = '–';
        } else {
            e.target.innerText = '+';
        }

        // Находим родительский элемент (в данном случае, div с классом "header")
        const parentDiv = e.target.parentNode;

        // Ищем следующий элемент на том же уровне
        const menu = parentDiv ? parentDiv.nextElementSibling : null;

        console.log(menu)

        if (menu) {
            menu.classList.toggle('active');
        }
    }
})


// --------------------------------------------Перетаскивание меню--------------------------------------------- //
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

document.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('headeR')) {
        draggedElement = e.target.closest('.jquery-right-menu, .jquery-center-menu, .jquery-logs-menu');
        const rect = draggedElement.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    }
});

document.addEventListener('mousemove', (e) => {
    if (draggedElement) {
        draggedElement.style.left = (e.clientX - offsetX) + 'px';
        draggedElement.style.top = (e.clientY - offsetY) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    draggedElement = null;
});
// --------------------------------------------Перетаскивание меню--------------------------------------------- //


/* ----- */
//Запрос то что будет происходить при нажатии кнопки Отправить
document.addEventListener('click', function(event) {
    if (event.target.matches('#submit-buttonPlagin')) {
        //Запрос к GPT
        modul.queryToGPT()
    }
});


!(function() {

function timeout(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Таймаут запроса после ${ms} миллисекунд`));
        }, ms);
    });
}

let stopRequests = false;

// Установка обработчика клика на уровне документа для остановки запроса к GPT
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'stopButton') {
        stopRequests = true;
    }
});

async function queryToGPT() {
    sendNewRequest(); // Инициализация нового запроса
    const checkedCheckboxes = getCheckedCheckboxes();  // Получение массива отмеченных чекбоксов

    // Отображение индикатора загрузки и установка темного фона во время обработки запроса
    document.getElementById("spinner").style.display = "block";
    document.body.classList.add('darkFon');

    const spinnerLogsTime = document.querySelector('.spinnerLogsTime'); // Получение элемента для вывода времени
    const selectedText = document.getElementById('selected-text').value; // Получение выбранного текста
    const selectedCityString = document.getElementById('selected-city').value; // Получение строки с городами
    const systemMessage = document.getElementById('systemMessagePlagin').value; // Получение системного сообщения
    const charCountElement = document.getElementById('characters').value; // Получение количества символов
    const logsDiv = document.getElementById('systemLogs'); // Получение div для логов
    const logsList = document.querySelector('.logs-list'); // Получение списка логов

    const cityArray = selectedCityString.split('\n'); // Преобразование строки с городами в массив
    const textArray = selectedText.split(']').map(str => str.replace('[', '').trim()).filter(Boolean); // Разбиваем текст на строки
    
    const startTime = new Date(); // Запись времени начала запроса

    // Запуск интервала для обновления времени, прошедшего с начала запроса
    const intervalId = setInterval(() => {
        const now = new Date(); 
        const timeElapsed = now - startTime;
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = ((timeElapsed % 60000) / 1000).toFixed(0);
        const milliseconds = (timeElapsed % 1000).toFixed(0);
        spinnerLogsTime.textContent = `${minutes}:${seconds.padStart(2, '0')}.${milliseconds.padStart(3, '0')}`;
    }, 100);

    const MAX_RETRIES = 3;

    // Обход массива городов
    for (const [cityIndex, city] of cityArray.entries()) {
        let textIndex = textArray.length,// Получаем количество строк города
            lineCity = 1;// устонавливаем первый индекс для первого города
        if(lineCity >= textIndex){ // если индекс строки больше или равно общему количеству строк то присваиваем 1
            lineCity = 1;
        }
        for (const [i, text] of textArray.entries()) {
            let currentLineCheckbox = checkedCheckboxes[i]// Перебираем все полученные чекбоксы
            if (stopRequests) {
                logsDiv.innerHTML += "Остановлено пользователем обработку текстов для текущего города.<br>";
                break; // Прекратите обработку текстов для текущего города
            }
            let retries = 0;

            while (retries < MAX_RETRIES) {
                try {
                    // Отправка запроса на сервер с одним городом и одной строкой текста
                    const response = await Promise.race([
                        fetch('/apigptPlagin', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: new URLSearchParams({ 'selectedText': text, 'selectedCity': city.trim(), systemMessage, charCountElement, 'cityIndex': cityIndex, 'textIndex': lineCity++, 'totalNumberOfLines' : textIndex }),
                        }),
                        timeout(120000)
                    ]);

                    if (!response.ok) {
                        console.error(`Ошибка с городом ${city} и текстом ${text}:`, response.status);
                        logsDiv.innerHTML += `Ошибка с городом ${city} и текстом ${text}: ${response.status}<br>`;
                        retries++;
                        continue;
                    }

                    const data = await response.text();
                    sendToGoServer(data,currentLineCheckbox);// Передаем ответ GPT и чекбокc строки
                    console.log(data);
                    break;

                } catch (error) {
                    console.error(`Ошибка с городом ${city} и текстом ${text}:`, error);
                    logsDiv.innerHTML += `Ошибка с городом ${city} и текстом ${text}: ${error}<br>`;
                    retries++;
                }

                if (retries == MAX_RETRIES) {
                    logsDiv.innerHTML += `Превышено максимальное количество попыток для города ${city} и текста ${text}.<br>`;
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (stopRequests) {
            logsDiv.innerHTML += "Остановлено пользователем обработку остальных городов.<br>";
            stopRequests = false;
            break; // Прекратите обработку остальных городов
        }
    }

    clearInterval(intervalId);

    const endTime = new Date();
    const elapsedTime = endTime - startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = ((elapsedTime % 60000) / 1000).toFixed(0);
    const milliseconds = (elapsedTime % 1000).toFixed(0);

    logsDiv.innerHTML += `<p class='TotalRequestProcessingTime'>Общее время обработки запроса: ${minutes} минут, ${seconds.padStart(2, '0')} секунд, ${milliseconds.padStart(3, '0')} миллисекунд.</p>`;
    
    logsList.scrollTop = logsList.scrollHeight;

    showPagesInPageBlockPlagin();
    document.getElementById("spinner").style.display = "none";
    document.body.classList.remove('darkFon');
}

window.isNewRequest = false; // глобальная переменная для отслеживания нового запроса
// Функция для создания Вебсокит соединения
function initiateWebSocket() {
    // Указывает, используется ли безопасное соединение
    const isSecure = window.location.protocol === 'https:';

    // Получает имя хоста динамически
    const hostName = window.location.hostname;

    // Получение порта из URL, если он предоставлен, иначе используется порт по умолчанию 8080
    const port = window.location.port || '8080';

    // Устанавливает протокол в зависимости от того, является ли соединение безопасным
    const protocol = isSecure ? 'wss' : 'ws';
    console.log(protocol, hostName, port);


    // Если сокет уже открыт или открывается, не создаем новый
    if (window.socket && window.socket.readyState !== WebSocket.CLOSED) {
        return;
    }

    // Динамически создает URL веб-сокета
    // window.socket = new WebSocket(`${protocol}://${hostName}:8080/ws-endpoint`);
    window.socket = new WebSocket(`${protocol}://${hostName}/ws-endpoint`);



    window.socket.addEventListener('open', (event) => {
        console.log('Открытие веб-сокета:', event);
    });

    window.socket.addEventListener('error', (event) => {
        console.error('Ошибка веб-сокета:', event);
    });

    window.socket.addEventListener('message', (event) => {
        const logsDiv = document.getElementById('systemLogs'),
              logsList = document.querySelector('.logs-list');
        if (logsDiv) {
            if(window.isNewRequest) {
                logsDiv.innerHTML = ''; // Используйте внутренний HTML вместо значения
                window.isNewRequest = false;
            }
    
            // Добавьте новый HTML-контент. Убедитесь, что он очищен, чтобы предотвратить XSS-атаки.
            logsDiv.innerHTML += event.data; // Добавление разрыва строки с помощью <br>
    
            // Автоматическая прокрутка вниз
            logsList.scrollTop = logsList.scrollHeight;
        } else {
            console.error('Log container not found!');
        }
    });

    window.socket.addEventListener('close', (event) => {
        console.log('Вебсокет закрыт:', event);

        // Переподключение через 1 секунд после закрытия
        setTimeout(initiateWebSocket, 1);
    });

}

// Функция для отправки нового запроса вебсокет
function sendNewRequest() {
    window.isNewRequest = true; // установите этот флаг перед отправкой нового запроса
    // ваш код для отправки нового запроса через WebSocket
    if(window.socket && window.socket.readyState === WebSocket.OPEN) {
        // window.socket.send("Your new request data here");
    }
}

//Количество отмеченных символов
function updateCharacterCount() {
    const selectedTextElement = document.getElementById('selected-text');
    const charCountElement = document.getElementById('characters');
    const currentCharCount = selectedTextElement.value.length;
    charCountElement.value = currentCharCount;
    return currentCharCount
}

// Получаем текущий url
    var baseUrl = window.location.origin; // Начальный домен, например "https://example.com"
    var url = window.location.href;  // Получаем текущий URL
    var parts = url.split("/")
    var index = parts.indexOf('sites');
    if (index !== -1 && parts.length > index + 2) {
        var region = parts[index + 1];
        var service = parts[index + 2]
    }

// Добавить язык сайта в форму
function addLangSite() {
   // Получаем элемент textarea по его ID
let textarea = document.getElementById('systemMessagePlagin');

// Получаем текущий текст из textarea
let text = textarea.value;

const languageMapping = {
    "at": "НЕМЕЦКОМ",
    "be": "НИДЕРЛАНДСКОМ",
    "cz": "ЧЕШКОМ",
    "fr": "ФРАНЦУЗСКОМ",
    "gb": "АНГЛИЙСКОМ",
    "hu": "ВЕНГЕРСКОМ",
    "no": "НОРВЕЖСКОМ",
    "pl": "ПОЛЬСКОМ",
    "ru": "РУССКОМ"
};

let siteLanguage = languageMapping[region] || "Неизвестный язык";

// Заменяем "lang" на нужное значение языка
text = text.replace(/lang/g, siteLanguage);

// Устанавливаем обновленный текст обратно в textarea
textarea.value = text; 
}

// Обновляем количество символов при воде в форму
function updateWhenPrinting(){
    const selectedText = document.querySelector('#selected-text')
    selectedText.addEventListener('input', () => {
        updateCharacterCount()
        updateSystemMessage()// Обновляет длину символов в Системном сообщении для GPT
    })
}

// Функция showPagesInPageBlockPlagin вызывается для отправки запроса на сервер и получения данных о страницах
function showPagesInPageBlockPlagin() {
    if (region && service) {
        // Создаем объект с данными, которые хотим отправить
        var dataToSend = {
            region: region,
            service: service
        };

        // Выполняем POST-запрос к серверу с JSON в теле
        fetch('/showpagesinpageblockplagin', {
            method: 'POST', // Метод запроса
            headers: {
                'Content-Type': 'application/json' // Тип контента - JSON
            },
            body: JSON.stringify(dataToSend) // Преобразовываем объект в строку JSON
        })
        .then(response => response.json()) // Парсим ответ сервера из JSON
        .then(data => {
            // Проверяем, есть ли поле 'error' в ответе
            if (data.error) {
                // Обрабатываем ошибку, если она есть
                // console.error('Страницы не найдены:', data.message);
            } else {
                // Если ошибки нет, обрабатываем данные
                const pages_list_item = document.querySelector('.pages_list_item');
                const total_pages = document.querySelector('.total_pages');
                const btnDeleteAllPages = document.querySelector('.deleteAllPages');
                const styleSitemap = document.querySelector('.styleSitemap');

                total_pages.textContent = data.total_files;

                // Показывать или скрывать кнопку Удалить все
                if(+total_pages.textContent > 0){
                    btnDeleteAllPages.style.display = "block"
                    styleSitemap.style.display = 'inline-block';
                } else {
                    btnDeleteAllPages.style.display = "none"
                    styleSitemap.style.display = 'none';
                }

                pages_list_item.innerHTML = '';
                data.files_with_html.forEach((link, i) => {
                    pages_list_item.innerHTML += `
                        <div class = 'pageWrapper'>
                            <a class = 'linkPage' href = '${url}pages/${link}' target='_blank'>${data.files_without_html[i].toUpperCase()}</a>
                            <button class = 'deletePage' data-link='${link}'>X</button>
                        </div>`;
                });
                deletePage(region, service);
            }
        })
        .catch(error => {
            // Ловим и выводим в консоль любые ошибки
            // console.error('Ошибка:', error);
        });
    } else {
        // Если переменные region или service не определены
        console.log(region, service + " не найдены");
    }
}

// Удалить одну страницу
function deletePage(region, service) {
    const deleteBtn = document.querySelectorAll('.deletePage'),
          btnDeleteAllPages = document.querySelector('.deleteAllPages'),
          styleSitemap = document.querySelector('.styleSitemap');// Карта сайта

    deleteBtn.forEach(deleteP => {
        deleteP.addEventListener('click', function() {
            const link = this.getAttribute('data-link');

            // Уменьшаем счетчик количества страниц
            let total_pages = +document.querySelector('.total_pages').textContent;
            total_pages--;  
            document.querySelector('.total_pages').textContent = total_pages;

            // Показывать или скрывать кнопку Удалить все
            if(total_pages > 0){
                btnDeleteAllPages.style.display = "block"

            } else {
                btnDeleteAllPages.style.display = "none"
                styleSitemap.style.display = "none"
            }

            // Поиск ближайшего родительского элемента с классом 'pageWrapper' и изменение его стиля
            const pageWrapper = this.closest('.pageWrapper');
            if (pageWrapper) pageWrapper.style.display = 'none';
            
            // Создаем объект для хранения параметров запроса
            var data = new URLSearchParams();
            // Добавляем параметры region, service и link к запросу
            data.append('region', region);
            data.append('service', service);
            data.append('link', link);
            
            // Выполняем запрос к серверу с использованием fetch и методом POST
            fetch('/deletepagesplagin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: data.toString()
            })
            // Обрабатываем полученные данные
            .then(response => response.json())
            .then(data => {
                // Добавьте здесь ваш код для обработки ответа, если необходимо.
            })
            // В случае возникновения ошибки выводим ее в консоль
            .catch(error => {
                console.error('Ошибка:', error);
            });
        });
    });
}

// Удалить все страницы
function deleteAllPage() {
    const btnDeleteAllPages = document.querySelector('.deleteAllPages'),
          styleSitemap = document.querySelector('.styleSitemap');// Карта сайта
    btnDeleteAllPages.addEventListener('click', function() {
        // Обнуляем счетчик количества страниц, список городов и саму кнопку
        document.querySelector('.total_pages').textContent = "";
        document.querySelector('.pages_list_item').innerHTML = "";
        styleSitemap.style.display = 'none';
        btnDeleteAllPages.style.display = 'none';

        // Создаем объект для хранения параметров запроса
        var data = new URLSearchParams();
        // Добавляем параметры region, service и link к запросу
        data.append('region', region);
        data.append('service', service);
        
        // Выполняем запрос к серверу с использованием fetch и методом POST
        fetch('/deleteAllPagesPlagin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data.toString()
        })
        // Обрабатываем полученные данные
        .then(response => response.json())
        .then(data => {
            // Добавьте здесь ваш код для обработки ответа, если необходимо.
        })
        // В случае возникновения ошибки выводим ее в консоль
        .catch(error => {
            console.error('Ошибка:', error);
        });
    });

}

// Функция отправки текста на сервер Go для создания LadingPage
async function sendToGoServer(text,currentLineCheckbox) {
    const data = new URLSearchParams();
    data.append('text', text);
    data.append('checked', currentLineCheckbox);// Тут получает чекбокс отмеченой строки
    data.append('baseUrl', baseUrl);
    data.append('region', region);
    data.append('service', service);
    try {
        const response = await fetch('/CreateLandingPagePlagin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data
        });
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
    }
}

// Массив для хранения порядка отмеченных чекбоксов
let checkedOrder = [];

// Обработчик события изменения (change) на родительском элементе (тело документа)
document.body.addEventListener('change', (event) => {
    // Проверка, является ли измененный элемент чекбоксом
    if (event.target.type === 'checkbox') {
        // Если чекбокс был отмечен
        if (event.target.checked) {
            // Добавляем имя чекбокса в массив
            checkedOrder.push(event.target.name);
        } else {
            // Если чекбокс был снят, удаляем его имя из массива
            checkedOrder = checkedOrder.filter(name => name !== event.target.name);
        }
    }
});

// Функция для получения списка имен всех отмеченных чекбоксов в порядке их выбора
function getCheckedCheckboxes() {
    // Возвращаем копию массива, чтобы изолировать оригинальный массив от внешних изменений
    return [...checkedOrder];
}

// Функция для подсчета количество введенных городов
function numberOfCities() {
    const selectedCity = document.querySelector('#selected-city');
    const numberOfCitiesElement = document.querySelector('.numberOfCities');

    function updateNumberOfCities() {
        // Убираем пробелы и переносы строк в начале и конце,
        // не затрагивая пробелы и переносы строк в середине текста.
        const cleanedValue = selectedCity.value.replace(/^\s+|\s+$/g, '');
        
        const lines = cleanedValue.split('\n').filter(line => line.trim() !== '').length; // Фильтруем пустые строки и подсчитываем количество оставшихся
        numberOfCitiesElement.textContent = lines;
    }

    // обновляем счетчик строк при вводе
    selectedCity.addEventListener('input', updateNumberOfCities);

    // обновляем счетчик строк при загрузке страницы
    updateNumberOfCities();
}


//----Модули
window.modul = {
    queryToGPT,
    updateCharacterCount,
    showPagesInPageBlockPlagin,
    numberOfCities,
    initiateWebSocket,
    deleteAllPage,
    addLangSite,
    updateWhenPrinting,
}

})()