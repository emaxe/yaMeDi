#!/usr/bin/env bash
set -uo pipefail

# APP_DIR теперь указывает на директорию, где лежит сам скрипт
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE_DEV="/tmp/yandex-metrics-dashboard-dev.pid"
PID_FILE_PREVIEW="/tmp/yandex-metrics-dashboard-preview.pid"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
    printf "\n${BLUE}════════════════════════════════════════════════════════════${NC}\n"
    printf "${BOLD}${BLUE}  Yandex Metrics Dashboard — менеджер приложения${NC}\n"
    printf "${BLUE}  Каталог: ${CYAN}%s${NC}\n" "$APP_DIR"
    printf "${BLUE}════════════════════════════════════════════════════════════${NC}\n\n"
}

# --- macOS GUI helper: osascript для foreground-запуска в Terminal ---
launch_in_terminal() {
    local cmd="$1"
    osascript -e "tell application \"Terminal\" to do script \"$cmd\"" >/dev/null 2>&1
}

find_electron_pids() {
    pgrep -f "electron.*testApp" 2>/dev/null || true
}

find_vite_pids() {
    pgrep -f "node.*vite.*testApp" 2>/dev/null || true
}

status_dev() {
    local epids
    epids=$(find_electron_pids)
    if [[ -n "$epids" ]]; then
        printf "${GREEN}▶ Dev/Electron запущен (PID: %s)${NC}\n" "$(echo "$epids" | head -1 | tr -d '\n')"
        return 0
    fi
    local vpids
    vpids=$(find_vite_pids)
    if [[ -n "$vpids" ]]; then
        printf "${YELLOW}▶ Vite dev сервер запущен (PID: %s), Electron ещё не подключился${NC}\n" "$(echo "$vpids" | head -1 | tr -d '\n')"
        return 0
    fi
    printf "${RED}◯ Dev-режим не запущен${NC}\n"
    return 1
}

status_preview() {
    if [[ -f "$PID_FILE_PREVIEW" ]]; then
        local pid
        pid=$(cat "$PID_FILE_PREVIEW" 2>/dev/null)
        if kill -0 "$pid" 2>/dev/null; then
            printf "${GREEN}▶ Preview запущен (PID: %s)${NC}\n" "$pid"
            return 0
        fi
    fi
    printf "${RED}◯ Preview не запущен${NC}\n"
    return 1
}

stop_app() {
    local mode="$1"
    local found=0
    printf "\n${YELLOW}⏹ Остановка приложения...${NC}\n"

    if [[ "$mode" == "all" || "$mode" == "dev" ]]; then
        for p in $(find_electron_pids); do
            kill "$p" 2>/dev/null && found=1
        done
        for p in $(find_vite_pids); do
            kill "$p" 2>/dev/null && found=1
        done
        rm -f "$PID_FILE_DEV"
    fi

    if [[ "$mode" == "all" || "$mode" == "preview" ]]; then
        if [[ -f "$PID_FILE_PREVIEW" ]]; then
            local pid
            pid=$(cat "$PID_FILE_PREVIEW" 2>/dev/null)
            if [[ -n "$pid" ]]; then
                kill "$pid" 2>/dev/null && found=1
                kill -- -"$pid" 2>/dev/null || true
            fi
            rm -f "$PID_FILE_PREVIEW"
        fi
    fi

    if [[ $found -eq 1 ]]; then
        printf "${GREEN}✅ Приложение остановлено${NC}\n"
    else
        printf "${YELLOW}ℹ️  Нет запущенных процессов${NC}\n"
    fi
}

start_dev() {
    stop_app "dev"
    printf "\n${CYAN}▶ Запуск dev-режима...${NC}\n"
    printf "${CYAN}   Открывается новое окно Terminal с Vite + Electron${NC}\n"
    local cmd="cd '$APP_DIR' && pkill -f 'electron.*testApp' 2>/dev/null; pkill -f 'node.*vite.*testApp' 2>/dev/null; sleep 1; npm run dev"
    launch_in_terminal "$cmd"
    printf "${GREEN}✅ Terminal открыт, dev-сервер запускается...${NC}\n"
    printf "${CYAN}   Electron окно появится через 5–10 секунд${NC}\n"
    sleep 2
}

start_preview() {
    stop_app "all"
    printf "\n${CYAN}▶ Сборка и запуск preview...${NC}\n"
    cd "$APP_DIR"
    if ! npm run build > /tmp/yandex-metrics-build.log 2>&1; then
        printf "${RED}❌ Ошибка сборки!${NC}\n"
        printf "${CYAN}   Лог: /tmp/yandex-metrics-build.log${NC}\n"
        return 1
    fi
    nohup npx vite preview --port 4173 > /tmp/yandex-metrics-preview.log 2>&1 &
    local pid=$!
    echo "$pid" > "$PID_FILE_PREVIEW"
    printf "${GREEN}✅ Preview сервер запущен (PID: %s)${NC}\n" "$pid"
    printf "${CYAN}   Откройте в браузере: http://localhost:4173${NC}\n"
    sleep 2
}

build_app() {
    printf "\n${CYAN}▶ Сборка production...${NC}\n"
    cd "$APP_DIR"
    if npm run build > /tmp/yandex-metrics-build.log 2>&1; then
        printf "${GREEN}✅ Сборка завершена успешно${NC}\n"
    else
        printf "${RED}❌ Ошибка сборки!${NC}\n"
    fi
    printf "${CYAN}   Лог: /tmp/yandex-metrics-build.log${NC}\n"
    sleep 1
}

show_logs() {
    printf "\n${CYAN}▶ Логи (Ctrl+C для выхода из просмотра)${NC}\n"
    local log_file=""
    printf "  1) Лог dev (npm run dev)\n"
    printf "  2) Лог сборки (npm run build)\n"
    printf "  3) Лог preview\n"
    printf "  0) Назад\n"
    printf "Выберите: "
    read -r log_choice
    case "$log_choice" in
        1) log_file="/tmp/yandex-metrics-dev.log" ;;
        2) log_file="/tmp/yandex-metrics-build.log" ;;
        3) log_file="/tmp/yandex-metrics-preview.log" ;;
        *) return ;;
    esac
    if [[ -f "$log_file" ]]; then
        tail -n 50 -f "$log_file"
    else
        printf "${YELLOW}Лог-файл не найден: %s${NC}\n" "$log_file"
        sleep 1
    fi
}

install_deps() {
    printf "\n${CYAN}▶ Установка зависимостей...${NC}\n"
    cd "$APP_DIR"
    if npm install --no-audit --no-fund > /tmp/yandex-metrics-install.log 2>&1; then
        printf "${GREEN}✅ Зависимости установлены${NC}\n"
    else
        printf "${RED}❌ Ошибка установки!${NC}\n"
    fi
    printf "${CYAN}   Лог: /tmp/yandex-metrics-install.log${NC}\n"
    sleep 1
}

# ─── Главное меню (цикл) ──────────────────────────────────────────────────────

while true; do
    clear
    print_header

    printf "${BOLD}Текущее состояние:${NC}\n"
    status_dev
    status_preview

    printf "\n${BOLD}Меню:${NC}\n\n"
    printf "  ${CYAN}1)${NC} Запуск dev (новое окно Terminal)${NC}\n"
    printf "  ${CYAN}2)${NC} Перезапуск dev${NC}\n"
    printf "  ${CYAN}3)${NC} Остановить dev${NC}\n\n"
    printf "  ${CYAN}4)${NC} Сборка production${NC}\n"
    printf "  ${CYAN}5)${NC} Запуск preview (сборка + preview)${NC}\n"
    printf "  ${CYAN}6)${NC} Перезапуск preview${NC}\n"
    printf "  ${CYAN}7)${NC} Остановить preview${NC}\n\n"
    printf "  ${CYAN}8)${NC} Остановить ВСЁ${NC}\n"
    printf "  ${CYAN}9)${NC} Просмотр логов${NC}\n"
    printf "  ${CYAN}i)${NC} Установить зависимости${NC}\n\n"
    printf "  ${RED}0)${NC} Выход${NC}\n\n"

    printf "${BOLD}Введите номер действия: ${NC}"
    read -r choice

    case "$choice" in
        1) start_dev ;;
        2) start_dev ;;
        3) stop_app "dev" ;;
        4) build_app ;;
        5) start_preview ;;
        6) start_preview ;;
        7) stop_app "preview" ;;
        8) stop_app "all" ;;
        9) show_logs ;;
        i|I) install_deps ;;
        0|q|Q)
            printf "\n${YELLOW}Остановить приложение перед выходом? (y/n): ${NC}"
            read -r stop_confirm
            if [[ "$stop_confirm" == "y" || "$stop_confirm" == "Y" || "$stop_confirm" == "д" || "$stop_confirm" == "Д" ]]; then
                stop_app "all"
            fi
            printf "\n${GREEN}👋 До свидания!${NC}\n\n"
            exit 0
            ;;
        *)
            printf "\n${RED}Неверный выбор. Попробуйте снова.${NC}\n"
            sleep 1
            ;;
    esac

    printf "\n${CYAN}Нажмите Enter для возврата в меню...${NC}"
    read -r

done
