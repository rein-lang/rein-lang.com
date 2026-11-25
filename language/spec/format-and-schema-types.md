### Format and schema types

A format type is a `string` with a fixed shape, such as `Iri`. A schema type is a `string` whose shape a JSON Schema file defines. Both go where `string` goes. These rules need a rein release newer than 0.1.4.

- The checker treats a format type and a schema type as a `string`. A template can read one. A condition or a `switch` cannot (section 4, Inputs).
- A parameter or a field can have one of these types. A `const` answer cannot: `` a value of type `Iri` is not allowed as an answer; answer a struct with a field of type `Iri` ``.
- A parameter of one of these types is an input, as a `string` parameter is. The agent is never asked for it.
- The run checks each value against its type. The checks cover entry inputs (`--input`), hand-off arguments, the fields of a struct answer and the values of `rein eval --set`.
- A value that is not a JSON string, in a struct answer, gives `` field `pick.pr` must be a string ``.
- An empty value in a struct answer gives `` field `pick.pr` is empty; give some text ``. The rule is the same as for a `string` field.

#### Built-in format types

Rein has 19 built-in format types. Each one has a type name that a program writes, such as `Iri`, and a JSON name. The JSON name is the `type` of the field in the step JSON. The checks are the built-in `format` keywords of the jsonschema crate, as JSON Schema 2020-12 defines them.

The list of format types comes from the jsonschema crate, not from rein. It is the list of `ValidationOptions::known_formats` under draft 2020-12. The table below reflects jsonschema 0.63.1. A format that a later jsonschema release adds appears in rein when rein moves to that release. No rein change is needed for it.

The type name follows from the JSON name by one rule: split the JSON name on `-`, upper-case the first letter of each part, and join the parts. So `iri` gives `Iri`, `date-time` gives `DateTime`, and `relative-json-pointer` gives `RelativeJsonPointer`. Only the type name is valid in a program. `IRI` is not a type name.

A function can take a struct and read its fields, such as `({ link }: Input)`. This fragment shows the fields of such a struct:

```ts
interface Input {
  /** The link of the pull request. */
  link: Iri;
}
```

| Type | JSON name | Accepts |
| --- | --- | --- |
| `Iri` | `iri` | an absolute IRI, like `https://example.com/page` |
| `IriReference` | `iri-reference` | an IRI reference, like `/docs/page` |
| `Uri` | `uri` | an absolute URI, like `https://example.com/page` |
| `UriReference` | `uri-reference` | a URI reference, like `/docs/page` |
| `UriTemplate` | `uri-template` | a URI template, like `https://example.com/items/{id}` |
| `Email` | `email` | an email address, like `someone@example.com` |
| `IdnEmail` | `idn-email` | an email address, like `someone@example.com` |
| `Hostname` | `hostname` | a hostname, like `example.com` |
| `IdnHostname` | `idn-hostname` | a hostname, like `example.com` |
| `Ipv4` | `ipv4` | an IPv4 address, like `192.0.2.1` |
| `Ipv6` | `ipv6` | an IPv6 address, like `2001:db8::1` |
| `Date` | `date` | a date, like `2026-11-23` |
| `Time` | `time` | a time with an offset, like `13:45:00Z` |
| `DateTime` | `date-time` | a date and time, like `2026-11-23T13:45:00Z` |
| `Duration` | `duration` | an ISO 8601 duration, like `P1DT2H` |
| `Uuid` | `uuid` | a UUID, like `123e4567-e89b-12d3-a456-426614174000` |
| `JsonPointer` | `json-pointer` | a JSON Pointer, like `/items/0` |
| `RelativeJsonPointer` | `relative-json-pointer` | a relative JSON Pointer, like `1/items` |
| `Regex` | `regex` | a regular expression, like `^[a-z]+$` |

#### Schema types

A schema type is a string type that the project defines in a JSON Schema file. The import names the type:

```ts
import { Ticket } from "./ticket.schema";
```

The import reads `ticket.schema.json` in the folder of the importing file. Its path is relative, as for any import. The file holds one schema. A schema file needs no `examples` entry:

```json
{
  "title": "Ticket",
  "type": "string",
  "pattern": "^[A-Z]+-[0-9]+$",
  "maxLength": 20
}
```

Rules for the schema file:

- It has `"type": "string"`. Another type is an error: `` a schema type must have `"type": "string"` ``.
- It has a `title`. The `title` is a valid name, and it is the name that the import gives. Another name is an error: `` `./ticket.schema` declares `Ticket`, not `Issue`; write `import { Ticket } from "./ticket.schema"` ``.
- Load errors start with the schema file name, such as `` `ticket.schema.json`: a schema type must have `"type": "string"` ``.
- A file that the project does not have is an error: `` cannot find schema `./ticket.schema`; add a `ticket.schema.json` file ``. The message names the full project path, so a schema in a subfolder shows that folder in the path.
- A schema type is a type only. Using its name as a function or a struct is an error.

#### Names

A user name wins over a built-in format name. In a file that declares `interface Date`, or that imports a name `Date` (a schema, struct or function import), `Date` means that user type. The format `Date` is not used in that file. The rule applies to every format name, such as `Email`, and only in that file.

```ts
import { Email } from "./email.schema";
```

Here `Email` is the schema type of `email.schema.json`, and its `pattern` decides which values pass.

#### Checks

Each check reports the value and the type that it fails:

- An entry input that fails its format: `` `link` must match format `iri`; got `example.com` ``.
- A value that fails a schema type: `` `ticket` does not match `Ticket`: `` followed by the first error of the schema.
- A hand-off argument that fails its type. The error names the target function and the parameter.
- A field of a struct answer that fails its type. The error names the answer and the field, such as `pick.pr`.

The page of `rein debug` gives stand-in values to each input that has no value, and it skips the format checks for those stand-in values. The page checks a format value that you set in a struct answer. A value that you give to `rein graph` with `--input` is a real value, and it is checked.

Real runs check each format or schema value that they get. These are `rein step`, `rein run`, `rein graph --input`, `rein eval --set`, the debug adapter (`rein dap`), and the MCP tools `rein_start` and `rein_answer`.

#### Step JSON

A field of a format or schema type has a `schema` key in the step JSON. For a format type, the key holds the JSON Schema of the type, such as `{"type": "string", "format": "iri"}`. For a schema type, it holds the schema of the file, and the `type` of the field is `string`. A field of another type has no `schema` key.
