# desafio_teste_sudoku

Casos de teste em JavaScript para testar um **Sudoku binário 6 x 6** em JavaScript.

Este repositório tem **só os testes**. O jogo deve ser implementado a partir da especificação abaixo e precisa passar em todos os casos de teste.

## Colaboradores

- Heitor Henrique Scramim de Freitas | RA: 24190382-2

## Especificação do desafio

Sudoku binário (também chamado Takuzu ou Binairo) com grade de **6 x 6**.

### Regras do jogo

1. Cada célula recebe **0** ou **1**.
2. Cada linha e cada coluna tem **três 0 e três 1**. Durante o jogo, nenhuma linha ou coluna pode passar de três 0 ou três 1.
3. Não pode haver **três números iguais seguidos** numa linha ou coluna (`000` ou `111`). Células vazias quebram a sequência.
4. **Não pode haver duas linhas completas iguais nem duas colunas completas iguais.** Linhas ou colunas ainda incompletas podem ser parecidas.
5. As pistas da grade inicial são **fixas**: não podem ser alteradas nem apagadas.
6. Uma jogada que quebra qualquer regra é **recusada** e a célula volta ao valor que tinha antes.
7. O jogo está **resolvido** quando todas as células estão preenchidas e nenhuma regra é quebrada.

### Contrato da implementação

Os testes importam o jogo de **`src/sudokuBinario.js`**, como módulo ES (o `package.json` usa `"type": "module"`). O arquivo deve exportar:

```js
export const TAMANHO = 6;
export const VAZIO = null;               // valor de célula vazia
export function lerGrade(texto) { ... }
export function sequenciaValida(seq) { ... }
export class SudokuBinario { ... }
```

#### Funções

| Função | Retorno | Descrição |
|--------|---------|-----------|
| `lerGrade(texto)` | `Array<Array<0\|1\|null>>` | Converte um texto de 6 linhas com 6 caracteres cada (`0`, `1` ou `.` para vazio) numa matriz 6 x 6. Ignora espaços no começo e no fim de cada linha e linhas em branco no começo e no fim do texto. |
| `sequenciaValida(seq)` | `boolean` | Recebe 6 valores (uma linha ou coluna, podendo ter `null`) e diz se respeitam as regras 2 e 3. |

#### `new SudokuBinario(grade)`

Recebe uma matriz 6 x 6 com `0`, `1` ou `null`. A grade é copiada, e toda célula preenchida vira uma pista fixa.

Erros do construtor (todos `Error`):
- Grade que não é 6 x 6: mensagem contendo `"6 x 6"`.
- Valor diferente de `0`, `1` ou `null`: mensagem contendo `"Valores permitidos"`.
- Grade inicial que já quebra alguma regra: mensagem contendo `"viola"`.

`SudokuBinario.deTexto(texto)` é um atalho estático para `new SudokuBinario(lerGrade(texto))`.

#### Propriedades

| Propriedade | Descrição |
|-------------|-----------|
| `grade` | Matriz `[linha][coluna]` com os valores atuais. É uma propriedade comum e pode ser substituída; os métodos de verificação devem sempre ler o valor atual de `grade`. |
| `fixas` | Matriz 6 x 6 de booleanos: `true` onde a célula é uma pista inicial. |

#### Métodos

| Método | Retorno | Descrição |
|--------|---------|-----------|
| `jogar(linha, coluna, valor)` | `boolean` | Preenche a célula. Retorna `true` se a jogada respeita as regras. Se não respeitar, retorna `false` e mantém o valor anterior. |
| `limpar(linha, coluna)` | — | Deixa a célula vazia (`null`). |
| `completo()` | `boolean` | `true` se não há células vazias. |
| `resolvido()` | `boolean` | `true` se está completo e não quebra nenhuma regra. |
| `resolver()` | `boolean` | Preenche as células vazias com uma solução válida, sem alterar as pistas. Retorna `false` se não houver solução. |
| `contarSolucoes(limite = 2)` | `number` | Conta as soluções possíveis a partir do estado atual, parando ao chegar no `limite`. Aceita `Infinity` para contar todas. |
| `paraTexto()` | `string` | 6 linhas separadas por `\n`, com `0`, `1` ou `.` para vazio. |

Erros dos métodos `jogar` e `limpar`:
- Posição fora da grade (`linha` ou `coluna` fora de 0–5): `RangeError`.
- Célula fixa: `Error` com mensagem contendo `"fixa"`.
- `valor` diferente do número `0` ou `1` (inclusive a string `'1'`): `Error` com mensagem contendo `"0 ou 1"`.

## Casos de teste

Os testes usam o executor nativo do Node (`node:test` + `node:assert`). Não há dependências para instalar.

### Como rodar

Requer Node.js 18 ou mais recente. Com a implementação em `src/sudokuBinario.js`, rode:

```bash
npm test
```

### Como funcionam

Os testes ficam em `test/sudokuBinario.test.js`. Eles usam um quebra-cabeça com 8 pistas e **solução única**, além da solução dele:

```
PUZZLE      SOLUÇÃO
....1.      001011
.0....      001101
...0..      110010
..0...      010011
1..1..      101100
1..1..      110100
```

| Grupo | O que verifica |
|-------|----------------|
| Criação da grade | tamanho 6 x 6, leitura de texto, recusa de tamanho errado, de valores inválidos e de grade inicial inválida, pistas fixas |
| Regra de três 0 e três 1 | aceita 3 de cada, recusa um 4º valor igual em linha e em coluna |
| Regra sem três seguidos | recusa `000` e `111` no começo, no meio e no fim; vazios não contam |
| Regra sem repetição | recusa linha ou coluna completa igual a outra; linhas incompletas iguais são permitidas |
| Jogadas | preencher, não alterar pista fixa, só aceitar 0 ou 1, posição inválida, limpar, jogada recusada mantém o valor |
| Fim de jogo | grade inicial não resolvida, solução reconhecida, resolver jogada a jogada, grade cheia com regra quebrada não vale |
| Resolvedor | chega à solução esperada, solução única, mantém as pistas, detecta grade sem solução, e a grade 6 x 6 vazia tem exatamente **4140** soluções (valor conhecido, sequência A253316 da OEIS) |

São 31 casos de teste. Uma implementação correta deve terminar com `pass 31 | fail 0`.
