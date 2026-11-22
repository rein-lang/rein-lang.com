### Format and schema types

A format type is a `string` with a fixed shape, such as an IRI. A schema type is a `string` whose shape a JSON Schema file defines. Both go where `string` goes. These rules need a rein release newer than 0.1.4.

- The checker treats a format type and a schema type as a `string`. A template can read one. A condition or a `switch` cannot (section 4, Inputs).
- A parameter or a field can have one of these types. A `const` answer cannot: `` a `IRI` answer is not allowed; answer a struct with a `IRI` field ``.
- A parameter of one of these types is an input, as a `string` parameter is. The agent is never asked for it.
- The run checks each value against its type. The checks cover entry inputs (`--input`), hand-off arguments and the fields of a struct answer.
- A value that is not a JSON string, in a struct answer, gives `` field `pick.pr` must be a string ``.

#### Built-in format types

Rein has 19 built-in format types. Each one has a name that a program writes, such as `IRI`, and a JSON name. The JSON name is the `type` of the field in the step JSON (section 11, Stepping). The checks are the built-in `format` keywords of the jsonschema crate, as JSON Schema 2020-12 defines them.

```ts
interface Input {
  /** The link of the pull request. */
  link: IRI;
}
```

| Type | JSON name | Accepts |
| --- | --- | --- |
| `IRI` | `iri` | an absolute IRI, like `https://example.com/page` |
| `IRIReference` | `iri-reference` | an IRI reference, like `/docs/page` |
| `URI` | `uri` | an absolute URI, like `https://example.com/page` |
| `URIReference` | `uri-reference` | a URI reference, like `/docs/page` |
| `URITemplate` | `uri-template` | a URI template, like `https://example.com/items/{id}` |
| `Email` | `email` | an email address, like `someone@example.com` |
| `IdnEmail` | `idn-email` | an email address, like `someone@example.com` |
| `Hostname` | `hostname` | a hostname, like `example.com` |
| `IdnHostname` | `idn-hostname` | a hostname, like `example.com` |
| `IPv4` | `ipv4` | an IPv4 address, like `192.0.2.1` |
| `IPv6` | `ipv6` | an IPv6 address, like `2001:db8::1` |
| `Date` | `date` | a date, like `2026-11-23` |
| `Time` | `time` | a time with an offset, like `13:45:00Z` |
| `DateTime` | `date-time` | a date and time, like `2026-11-23T13:45:00Z` |
| `Duration` | `duration` | an ISO 8601 duration, like `P1DT2H` |
| `UUID` | `uuid` | a UUID, like `123e4567-e89b-12d3-a456-426614174000` |
| `JSONPointer` | `json-pointer` | a JSON Pointer, like `/items/0` |
| `RelativeJSONPointer` | `relative-json-pointer` | a relative JSON Pointer, like `1/items` |
| `Regex` | `regex` | a regular expression, like `^[a-z]+$` |

#### Schema types

A schema type is a string type that the project defines in a JSON Schema file. The import names the type:

```ts
import { Ticket } from "./ticket.schema";
```

The import reads `ticket.schema.json` in the folder of the importing file. Its path is relative, as for any import. The file holds one schema:

```json
{
  "title": "Ticket",
  "type": "string",
  "pattern": "^[A-Z]+-[0-9]+$",
  "maxLength": 20,
  "examples": ["ABC-123"]
}
```

Rules for the schema file:

- It has `"type": "string"`. Another type is an error: `` a schema type must have `"type": "string"` ``.
- It has a `title`, and the `title` is the name that the import gives. Another name is an error: `` `./ticket.schema` declares `Ticket`, not `Issue`; write `import { Ticket } from "./ticket.schema"` ``.
- It has `examples` with at least one string. The first string of `examples` is the example. The example must pass the schema.
- A file that the project does not have is an error: `` cannot find schema `./ticket.schema`; add a `ticket.schema.json` file ``.
- A schema type is a type only. Using its name as a function or a struct is an error.

#### Checks

Each check reports the value and the type that it fails:

- An entry input that fails its format: `` `link` must be an absolute IRI, like `https://example.com/page`; got `example.com` ``.
- A value that fails a schema type: `` `ticket` does not match `Ticket`: `` followed by the first error of the schema.
- A hand-off argument that fails its type. The error names the target function and the parameter.
- A field of a struct answer that fails its type. The error names the answer and the field, such as `pick.pr`.

`rein graph` walks an entry input of a format or schema type with a valid example value, since it has no value for it. For a schema type, that value is its first example.

#### Step JSON

A field of a format or schema type has a `schema` key in the step JSON (section 11, Stepping). For a format type, the key holds the JSON Schema of the type, such as `{"type": "string", "format": "iri"}`. For a schema type, it holds the schema of the file. A field of another type has no `schema` key.
