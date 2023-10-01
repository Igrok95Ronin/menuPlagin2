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

    if (e.target.closest('#submit-button')) {
        const menu = document.querySelector('.jquery-logs-menu');
        menu.classList.add('active'); //не скрывать форму при повторном нажатии
    }
});

// активация при нажатии на кнопку M
document.addEventListener('keydown', function (e) {
    if (e.code === 'KeyM') {
        const rightMenu = document.querySelector('.jquery-right-menu');
        const otherMenus = document.querySelectorAll('.jquery-center-menu, .jquery-logs-menu');

        // Переключение для .jquery-right-menu
        rightMenu.classList.toggle('active');

        if (rightMenu.classList.contains('active')) {
            // Если jquery-right-menu активен, то выполняем ваш код
            modul.showPagesInPageBlockPlagin();
            modul.numberOfCities();
            document.querySelectorAll('h1, h2, h3, h4, h5, div, p, strong').forEach(addCheckbox);

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
        let allText = '';
        // Собирает текст из дочерних узлов элемента.
        for (let node of element.childNodes) {
            if (node.nodeType === 3) { // TEXT_NODE
                allText += node.nodeValue.trim();
            }
        }

        // Добавляет чекбокс, если длина текста больше 10 символов.
        if (allText && allText.length > 10) {
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
            });    
        }
    }
}



// Функция для удаления чекбоксов
function removeCheckboxes() {
    document.querySelectorAll('.custom-checkbox').forEach(function (checkbox) {
        checkbox.remove();
    });
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
    if (event.target.matches('#submit-button')) {
        //Запрос к GPT
        modul.queryToGPT()
    }
});


!(function() {

    //Запрос к GPT
function queryToGPT(){
    sendNewRequest();
     // Показать спиннер перед отправкой запроса
     document.getElementById("spinner").style.display = "block";
     document.body.classList.add('darkFon')//Затемняем фон при спинере


     // Получаем DOM элементов формы
    const selectedText = document.getElementById('selected-text').value,
        selectedCity = document.getElementById('selected-city').value,
        systemMessage = document.getElementById('systemMessage').value,
        charCountElement = document.getElementById('characters').value,
        systemLogs = document.getElementById('systemLogs');

    // Отправляем данные на сервер
    fetch('/apigptPlagin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'selectedText': selectedText,
            'selectedCity': selectedCity,
            'systemMessage': systemMessage,
            'charCountElement': charCountElement,
        })
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Ошибка на сервере');
        }
    })
    .then(data => {
        //В поле логи добавляем с сервера
        // systemLogs.value = data;
        
        // Обработка ответа от сервера, если это необходимо
        sendToGoServer(data)

        //Отпарвка запроса на серве для добавления созданных страниц в блок Pages
        showPagesInPageBlockPlagin()
        // Скрыть спиннер после завершения запроса
        document.getElementById("spinner").style.display = "none";
        document.body.classList.remove('darkFon')//Убераем затемнение фона
    })
    .catch(error => {
        console.error('Ошибка:', error);

        // Скрыть спиннер после завершения запроса
        document.getElementById("spinner").style.display = "none";
        document.body.classList.remove('darkFon')//Убераем затемнение фона
    });


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
    window.socket = new WebSocket(`${protocol}://${hostName}/ws-endpoint`);


    window.socket.addEventListener('open', (event) => {
        console.log('Открытие веб-сокета:', event);
    });

    window.socket.addEventListener('error', (event) => {
        console.error('Ошибка веб-сокета:', event);
    });

    window.socket.addEventListener('message', (event) => {
        const logsTextarea = document.getElementById('systemLogs');
        if (logsTextarea) {
            // Если это новый запрос, очистите поле логов
            if(window.isNewRequest) {
                logsTextarea.value = '';
                window.isNewRequest = false; // сбросить флаг нового запроса
            }
            // Добавление нового сообщения в поле логов
            logsTextarea.value += event.data + '\n';

        // Автоматическая прокрутка вниз
        logsTextarea.scrollTop = logsTextarea.scrollHeight;
        } else {
            console.error('Текстовое поле для логов не найдено!');
        }
    });

    window.socket.addEventListener('close', (event) => {
        console.log('Вебсокет закрыт:', event);

        // Переподключение через 5 секунд после закрытия
        setTimeout(initiateWebSocket, 5000);
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
}

// Получаем текущий url
    var url = window.location.href;  // Получаем текущий URL
    var parts = url.split("/")
    var index = parts.indexOf('sites');
    if (index !== -1 && parts.length > index + 2) {
        var region = parts[index + 1];
        var service = parts[index + 2]
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
                console.error('Server error:', data.error);
            } else {
                // Если ошибки нет, обрабатываем данные
                const pages_list_item = document.querySelector('.pages_list_item');
                const total_pages = document.querySelector('.total_pages');
                total_pages.textContent = data.total_files;
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
            console.error('Ошибка:', error);
        });
    } else {
        // Если переменные region или service не определены
        console.log(region, service + " не найдены");
    }
}


// Удалить созданные страницы
function deletePage(region, service) {
    const deleteBtn = document.querySelectorAll('.deletePage');
    deleteBtn.forEach(deleteP => {
        deleteP.addEventListener('click', function() {
            const link = this.getAttribute('data-link');

            // Уменьшаем счетчик количества страниц
            let total_pages = +document.querySelector('.total_pages').textContent;
            total_pages--;  
            document.querySelector('.total_pages').textContent = total_pages;


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

// Функция отправки текста на сервер Go для создания LadingPage
async function sendToGoServer(text) {
    const checkedCheckboxes = getCheckedCheckboxes();  // Получение массива отмеченных чекбоксов
    const data = new URLSearchParams();
    data.append('text', text);
    data.append('checked', checkedCheckboxes.join(','));
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

// Функция для получения всех отмеченных чекбоксов
function getCheckedCheckboxes() {
   const checkboxes = document.querySelectorAll('input[type="checkbox"]');  // Получение всех чекбоксов
   let checkedValues = [];  // Массив для хранения отмеченных чекбоксов
   checkboxes.forEach(checkbox => {
       if (checkbox.checked) {
           checkedValues.push(checkbox.name);  // Добавление значения чекбокса в массив, если он отмечен
       }
   });
   return checkedValues;  // Возвращение массива отмеченных чекбоксов
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
}

})()
