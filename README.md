# Satellite PM2 Controller

Прототип отказоустойчивого бортового программного обеспечения спутника с использованием PM2.

## Требования

- **Node.js** 18+
- **npm**
- **Docker** (для Redis)
- **PM2** (устанавливается автоматически)

## Установка

```bash
git clone https://github.com/HuMaNus2s/satellite-pm2-controller.git
cd satellite-pm2-controller
```
### Установка зависимостей
```bash
npm install
```

## Запуск Redis (обязательно)

Redis нужен для синхронизации координат между воркерами и сохранения очереди задач.

```bash
docker run -d --name satellite-redis -p 6379:6379 redis:7
```

Проверить что Redis запущен:
```bash
docker ps | grep satellite-redis
```

> Если Redis не запущен, приложение работает в in-memory режиме — координаты будут меняться, но не будут синхронизироваться между gateway и orientation-воркерами.

## Запуск приложения

```bash
npm start
```

Эта команда запускает:
- **pm2** 
- **gateway** (1 экземпляр, порт 3000) — HTTP API + симулятор дрейфа координат
- **orientation** (2 экземпляра в cluster mode) — модуль управления ориентацией

Проверить статус:
```bash
npx pm2 status
```

## API Endpoints

После запуска сервер доступен на `http://localhost:3000`

### Состояние спутника
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/healthcheck` | Проверка доступности шлюза |
| GET | `/api/coords` | Координаты (текущие, эталонные, отклонение) |

### Фото
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/photos/list` | Список готовых фото |
| GET | `/api/photos/get/:id` | Скачать фото (SVG) |
| DELETE | `/api/photos/get/:id` | Удалить фото |

### Задачи
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/tasks/list` | Очередь задач на съёмку |
| PUT | `/api/tasks/photo` | Добавить задачу на съёмку |

### Управление процессами (PM2)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/processes` | Список процессов с метриками |
| POST | `/api/restart/:name` | Жёсткий перезапуск процесса |
| POST | `/api/reload/:name` | Zero-downtime reload |
| POST | `/api/stop/:name` | Остановка процесса |
| GET | `/api/logs/:name` | Последние 30 строк лога процесса |

## Запуск тестов

```bash
npm test
```

### Пример команд

1. **Координаты:**
   ```bash
   curl http://localhost:3000/api/coords
   ```

2. **Добавить задачу на фото:**
   ```bash
   curl -X PUT http://localhost:3000/api/tasks/photo
   ```

3. **Посмотреть очередь:**
   ```bash
   curl http://localhost:3000/api/tasks/list
   ```

4. **Получить логи orientation:**
   ```bash
   curl http://localhost:3000/api/logs/orientation
   ```

## Остановка

```bash
npm stop
```
Остановка pm2(навсякий случай)
```bash
npx pm2 stop all
```

Остановка Redis:
```bash
docker stop satellite-redis