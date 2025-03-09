import kaplay from "kaplay";

// Инициализация на весь экран
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const k = kaplay({
  width: screenWidth,
  height: screenHeight,
  canvas: document.getElementById("game"),
  background: [0, 128, 0], // Зеленый фон
});

// Глобальные переменные
let money = 100;
let fields = Array(9)
  .fill(null)
  .map((_, i) => ({
    id: i,
    unlocked: i === 0,
    planted: false,
    growthTime: 0,
    harvestReady: false,
  }));

// Сцена игры
k.scene("main", () => {
  // Деньги
  const moneyText = k.add([
    k.text(`Деньги: ${money}`, { size: screenWidth * 0.05 }),
    k.pos(20, 20),
    k.color(1, 1, 1),
  ]);

  // Адаптивный расчет размера полей
  const isMobile = screenWidth < 480;
  const fieldSize = isMobile ? screenWidth * 0.2 : screenWidth * 0.15;
  const spacing = isMobile ? fieldSize * 1.2 : fieldSize * 1.3;

  // Центрирование всей сетки полей
  const gridWidth = spacing * 3;
  const startX = (screenWidth - gridWidth) / 2 + fieldSize / 2;
  const startY = screenHeight * 0.2;

  // Создание полей
  for (let i = 0; i < 9; i++) {
    const field = fields[i];
    const row = Math.floor(i / 3);
    const col = i % 3;

    const x = startX + col * spacing;
    const y = startY + row * spacing;

    // Убедимся, что поля не выходят за пределы экрана
    if (x + fieldSize / 2 > screenWidth || y + fieldSize / 2 > screenHeight) {
      continue;
    }

    // Черная граница
    k.add([
      k.rect(fieldSize + 4, fieldSize + 4),
      k.pos(x, y),
      k.color(0, 0, 0),
      k.anchor("center"),
    ]);

    // Само поле
    const fieldRect = k.add([
      k.rect(fieldSize, fieldSize),
      k.pos(x, y),
      k.color(field.unlocked ? [255, 255, 255] : [100, 100, 100]),
      k.area(),
      k.anchor("center"),
      "field",
      { id: field.id },
    ]);

    // Номер поля
    k.add([
      k.text(`${field.id + 1}`, { size: fieldSize * 0.2 }),
      k.pos(x, y - fieldSize * 0.3),
      k.color(0, 0, 0),
      k.anchor("center"),
    ]);

    // Если поле заблокировано, показываем цену
    if (!field.unlocked) {
      k.add([
        k.text("50₽", { size: fieldSize * 0.25 }),
        k.pos(x, y),
        k.color(1, 1, 0),
        k.outline(1, [0, 0, 0]),
        k.anchor("center"),
      ]);
    }

    // Если поле разблокировано и посажено, показываем растение
    if (field.unlocked && field.planted) {
      const plant = k.add([
        k.rect(fieldSize * 0.5, fieldSize * 0.6),
        k.pos(x, y),
        k.color(0, 200, 0),
        k.anchor("center"),
        "plant",
        { fieldId: field.id },
      ]);

      // Если урожай готов, показываем значок $
      if (field.harvestReady) {
        k.add([
          k.text("$", { size: fieldSize * 0.3 }),
          k.pos(x, y - fieldSize * 0.1),
          k.color(1, 1, 0),
          k.anchor("center"),
        ]);
      }
    }

    // Вот здесь добавляем обработчик клика для поля
    fieldRect.onClick(() => {
      if (!field.unlocked && money >= 50) {
        // Разблокировать поле
        fields[field.id].unlocked = true;
        money -= 50;
        moneyText.text = `Деньги: ${money}`;
        fieldRect.color = [255, 255, 255];
      } else if (field.unlocked && !field.planted && money >= 10) {
        // Посадить растение
        fields[field.id].planted = true;
        fields[field.id].growthTime = 5; // 5 секунд роста
        fields[field.id].harvestReady = false;
        money -= 10;
        moneyText.text = `Деньги: ${money}`;
        k.go("main"); // Перезагрузка сцены для обновления
      } else if (field.unlocked && field.planted && field.harvestReady) {
        // Собрать урожай
        fields[field.id].planted = false;
        fields[field.id].harvestReady = false;
        money += 30;
        moneyText.text = `Деньги: ${money}`;
        k.go("main"); // Перезагрузка сцены для обновления
      }
    });
  }

  // Обновление роста растений
  k.onUpdate(() => {
    fields.forEach((field, index) => {
      if (field.planted && field.growthTime > 0) {
        fields[index].growthTime -= k.dt();
        if (fields[index].growthTime <= 0 && !fields[index].harvestReady) {
          fields[index].harvestReady = true;
          k.go("main"); // Перезагрузка сцены для обновления
        }
      }
    });
  });
});

// Запуск
k.go("main");
