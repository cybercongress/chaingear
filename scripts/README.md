#### expectations
!!! we no more use `sources.json/`, use `sources.toml/` instead.
supporting both formats would potentially lead to source races.

both scripts expect `sources.toml/` directory to exist,
none of them checks its presence or tries to create.



#### running
after you've done modifying source files:
```
$ node scripts/construct.js
```
(or whatever relative path)

#### installation
from `scripts/` folder run
```
$ npm install
```