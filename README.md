# Lucide icons for Mithril

this is a simple npm module that exports all lucide icons as simple
Mithril vnodes. It embed the svgs into hyperscript to be directly used
as vnodes.  License for this code (albeit trivial) is MIT (see
[LICENSE](./LICENSE)), license for all icons is ISC (see
[here](https://github.com/lucide-icons/lucide/blob/main/LICENSE), also
included in bundled js output).


## Usage
```typescript
import m, { Component } from "mithril";
import { Egg as EggIcon } from "lucide-mithril";

const MyComponent: Component = {
    view: () => {
        return m(".hello-world", [
                EggIcon
            ]);
    },
};
```
