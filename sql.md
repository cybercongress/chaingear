Дикий драфт (на корточках)
Простой реестр Create, Update, Delete

Свойства
- открытый код
- ugradability
- migratability
- отсутствие фин рисков

Тезисы:
- имя реестра: ENS name и ресолвер
- дескрипшн. hash либо в IPFS или Сварм. Опционально (256 chars)
- тэги есть (64 chars)
- трансфер обдумать
- метод получения реестров
- Ключ: инкремент uint32
- имя аттрибута. ловер кейс. -. цифры
- кто может создавать записи. Овнер реестра или кто угодно.
- expiration time - не нужно. Лишнее усложнение
- changable
[
- Registration cost
- Update cost
- Remove cost
- Transfer cost
] 
- Value distibition: parametr 1% фабрике. 99% создателю реестров.
- аукционы не надо.

Архитектура:
1. Мультисиг создатель фабрики реестра
2. Прокси контракт (ENS)
3. Фабрика реестров
4. Реестр реестров
5. Migration contract (future)



Fabric proxy: Ownable, Benificiaries, Destroyable
- getBuilder
- setBuilder
- getFee
- setFee
- getRegistries (reg address, reg name, creator)

Builder: Ownable, Destroyable
- version
- create()

Registry: Benificiaries, Owner, Destroyable
- permissionType: OnlyOwner, All, PermissionList
- getCreationFee
- setCreationFee
- getEntries
- createEntry (permissions)
- readEntry
- deleteEntry (permissions)

Entry: Ownable, Destroyable(if not in registry)
- readAttribute
- updateAttribute (only owner)
- getFee
- setFee (only owner)

Ownable:
- getOwner
- transferOwnership

Destroyable:
- destroy

Benificiaries: Ownable
  default - owner
- get ben
- add ben (only owner)
- delete ben (only owner)

