# Exeth

Ethereum script executor, WIP.

## Installation

Via npm on Node:

```
npm install -g exeth
```

## Usage

```
exeth <filename>
```

Example
```
exeth counter.eth
```

The default JSON RPC host is `http://localhost:8545`. To specify the
host use the flag `-h` or `--host`:

```
exeth counter.eth -h mymachine.com:4444
```

To enable logging to show additional message, use the flag `-l` or `--logging`:

```
exeth counter.eth -l
```

## References

TBD

## Samples

TBD

## Versions

- 0.0.1: Published, exeth global command
- 0.0.2: Published, async verb, rpc verb

## Contribution

Feel free to [file issues](https://github.com/ajlopez/exeth) and submit
[pull requests](https://github.com/ajlopez/exeth/pulls) — contributions are
welcome.

If you submit a pull request, please be sure to add or update corresponding
test cases, and ensure that `npm test` continues to pass.

