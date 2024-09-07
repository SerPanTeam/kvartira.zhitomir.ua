// Массив для хранения объектов недвижимости
let realEstateArray = [];

async function loadRealEstateData() {
    try {
        const response = await fetch('./yandex.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

        const offers = xmlDoc.querySelectorAll('offer');

        // Заполняем массив объектами недвижимости
        offers.forEach(offer => {
            let realEstateObject = {};

            // Получаем значение атрибута internal-id
            const internalId = offer.getAttribute('internal-id');
            realEstateObject['id'] = internalId; // Сохраняем ID в объекте

            // Обрабатываем каждый элемент <offer>
            processNode(offer, realEstateObject);

            // Обрабатываем теги <image> как массив картинок
            const images = [];
            offer.querySelectorAll('image').forEach(imageNode => {
                images.push(imageNode.textContent.trim());
            });
            realEstateObject['images'] = images; // Добавляем массив картинок в объект

            // Добавляем объект недвижимости в массив
            realEstateArray.push(realEstateObject);
        });

        // Для тестирования выводим массив в консоль
        console.log(realEstateArray);

        // После загрузки можно отобразить данные на странице
        //displayRealEstateData(realEstateArray);

    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

// Рекурсивная функция для обработки узлов (включая вложенные)
function processNode(node, targetObject) {
    node.childNodes.forEach(child => {
        if (child.nodeType === 1) { // Если это элемент (tag)
            const key = child.nodeName; // Имя тега

            // Если у этого элемента есть дочерние элементы
            if (child.childNodes.length > 1 && !['image'].includes(key)) {
                targetObject[key] = {}; // Создаем объект для вложенных тегов
                processNode(child, targetObject[key]); // Рекурсивно обрабатываем вложенные элементы
            } else {
                const value = child.textContent.trim(); // Его значение
                targetObject[key] = value; // Добавляем в объект как ключ и значение
            }
        }
    });
}

// Функция для отображения данных на странице
function displayRealEstateData(data) {
    const realEstateContainer = document.querySelector('.objects');
    realEstateContainer.innerHTML = ''; // Очищаем контейнер

    data.forEach(offer => {
        const realEstateElement = document.createElement('div');
        realEstateElement.classList.add('object');

        const imagesHtml = `<img src="${offer.images[0]}" alt="">`; //offer.images.map(image => `<img src="${image}" alt="Квартира">`).join('');

        // Иконки мессенджеров (Viber, WhatsApp, Telegram)
        const messengerHtml = `
                    <div class="messengers">

                    <a href="viber://chat?number=${offer['sales-agent'].phone.replace(/[^+\d]/g, '')}" target="_blank">
                        <i class="fab fa-viber"></i>
                    </a>
                    <a href="https://wa.me/${offer['sales-agent'].phone.replace(/[^+\d]/g, '')}" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                    <a href="tg://resolve?domain=${offer['sales-agent'].phone.replace(/[^+\d]/g, '')}" target="_blank">
                        <i class="fab fa-telegram-plane"></i>
                    </a>
                    </div>
            `;

        realEstateElement.innerHTML = `
            <div class="id">№: ${offer.id}</div>
            <div class="price">${offer.price.value} ${offer.price.currency}</div>
            <div class="title">${offer.type}: ${offer.category} </div>
            <div class="description">
            ${offer.rooms ? offer.rooms + " комн." : ""}
            ${offer.floor ? offer.floor + "/" : ""}
            ${offer['floors-total'] ? offer['floors-total'] + " эт." : ""}
            ${offer.area ? offer.area.value + " " + offer.area.unit : ""}
            ${offer['lot-area'] ? offer['lot-area'].value + " " + offer['lot-area'].unit : ""}
            </div>
            <div class="address">${offer.location.address}</div>
            <div class="img">${imagesHtml}</div>
            <div class="phone">${offer['sales-agent']?.phone|| 'Не указано'}</div>
            <div class="name">${offer['sales-agent'].name}</div>
            
            <button onclick="showSendDialog(${offer.id})">Написать</button>
            <button>Запомнить</button>
        `;
        realEstateContainer.appendChild(realEstateElement);
    });
}

const dialog = document.querySelector('#sendDialog');
// Закрытие модального окна по клику вне области модального окна
window.addEventListener('click', (event) => {
    if (event.target === dialog) {
        dialog.close();
    }
});

function showSendDialog(id){
    const sendMessageTextArea = document.querySelector('#sendMessageTextArea');
    sendMessageTextArea.textContent = `Добрый день. Меня интересует объект № ${id}.`;
    dialog.showModal();
}
function closeSendDialog(){
    const dialog = document.querySelector('#sendDialog');
    dialog.close();
}

// const menuItems = document.querySelectorAll('.menu-item');

// menuItems.forEach(item => {
//     item.addEventListener('click', () => {
//         const submenu = item.querySelector('.submenu');
//         if (submenu) {
//             submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
//         }
//     });
// });


// Вызов функции для загрузки данных
loadRealEstateData().then(()=>displayRealEstateData(realEstateArray));

console.log(realEstateArray);

function toggleMenu() {
    const menu = document.querySelector('.menu');
    menu.classList.toggle('open');
    document.body.classList.toggle('menu-open');
}

// Функция для открытия подменю
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        // Закрываем другие подменю
        document.querySelectorAll('.menu-item').forEach(i => {
            if (i !== this) {
                i.classList.remove('open');
            }
        });

        // Открываем или закрываем текущее подменю
        this.classList.toggle('open');
    });
});
