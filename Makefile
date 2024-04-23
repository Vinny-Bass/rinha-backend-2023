.PHONY: start-macos start-linux stop-macos stop-linux clean-macos clean-linux

MAC_OS_INFRA = infra/macos
LINUX_INFRA = infra/linux

start-macos:
	@cd $(MAC_OS_INFRA) && docker-compose up -d

start-linux:
	@cd $(LINUX_INFRA) && docker-compose up -d

build-macos:
	@cd $(MAC_OS_INFRA) && docker-compose up --build -d

build-linux:
	@cd $(LINUX_INFRA) && docker-compose up --build -d

stop-macos:
	@cd $(MAC_OS_INFRA) && docker-compose down

stop-linux:
	@cd $(LINUX_INFRA) && docker-compose down

clean-macos: stop-macos
	@cd $(MAC_OS_INFRA) && docker-compose down -v

clean-linux: stop-linux
	@cd $(LINUX_INFRA) && docker-compose down -v
