const {
  SudokuBinario, TAMANHO, VAZIO, lerGrade, sequenciaValida,
} = require('../src/sudokuBinario');

// Quebra-cabeça com solução única (8 pistas) e sua solução.
const PUZZLE = `
  ....1.
  .0....
  ...0..
  ..0...
  1..1..
  1..1..
`;

const SOLUCAO = `
  001011
  001101
  110010
  010011
  101100
  110100
`;

const vazia = () => Array.from({ length: TAMANHO }, () => Array(TAMANHO).fill(VAZIO));

describe('Criação da grade', () => {
  it('é 6 x 6', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    expect(jogo.grade.length).toBe(6);
    jogo.grade.forEach((l) => expect(l.length).toBe(6));
  });

  it('lê texto com "." como vazio', () => {
    const g = lerGrade('1.0...\n......\n......\n......\n......\n......');
    expect(g[0]).toEqual([1, VAZIO, 0, VAZIO, VAZIO, VAZIO]);
  });

  it('rejeita grade com tamanho diferente de 6 x 6', () => {
    expect(() => new SudokuBinario([[0, 1], [1, 0]])).toThrow(/6 x 6/);
    const sete = Array.from({ length: 6 }, () => Array(7).fill(VAZIO));
    expect(() => new SudokuBinario(sete)).toThrow(/6 x 6/);
  });

  it('rejeita valores diferentes de 0, 1 ou vazio', () => {
    const g = vazia();
    g[0][0] = 2;
    expect(() => new SudokuBinario(g)).toThrow(/Valores permitidos/);
  });

  it('rejeita grade inicial que já viola as regras', () => {
    const g = vazia();
    g[0][0] = g[0][1] = g[0][2] = 1;
    expect(() => new SudokuBinario(g)).toThrow(/viola/);
  });

  it('as pistas iniciais ficam marcadas como fixas', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    expect(jogo.fixas[0][4]).toBe(true);
    expect(jogo.fixas[0][0]).toBe(false);
    expect(jogo.fixas.flat().filter(Boolean).length).toBe(8);
  });
});

describe('Regra: no máximo três 0 e três 1 por linha/coluna', () => {
  it('aceita 3 zeros e 3 uns', () => {
    expect(sequenciaValida([0, 0, 1, 0, 1, 1])).toBe(true);
  });

  it('rejeita quatro 1 na mesma linha', () => {
    expect(sequenciaValida([1, 0, 1, 1, 0, 1])).toBe(false);
  });

  it('rejeita quatro 0 em uma coluna durante o jogo', () => {
    const g = vazia();
    g[0][0] = 0; g[1][0] = 1; g[2][0] = 0; g[3][0] = 0; g[4][0] = 1;
    const jogo = new SudokuBinario(g);
    expect(jogo.jogar(5, 0, 0)).toBe(false); // seria o 4º zero
    expect(jogo.jogar(5, 0, 1)).toBe(true);
  });
});

describe('Regra: sem três iguais consecutivos', () => {
  it('rejeita 000 na linha', () => {
    expect(sequenciaValida([1, 0, 0, 0, 1, 1])).toBe(false);
  });

  it('rejeita 111 no começo e no fim', () => {
    expect(sequenciaValida([1, 1, 1, VAZIO, VAZIO, VAZIO])).toBe(false);
    expect(sequenciaValida([VAZIO, VAZIO, VAZIO, 1, 1, 1])).toBe(false);
  });

  it('vazios não contam como sequência', () => {
    expect(sequenciaValida([VAZIO, VAZIO, VAZIO, VAZIO, VAZIO, VAZIO])).toBe(true);
    expect(sequenciaValida([1, 1, VAZIO, 1, VAZIO, VAZIO])).toBe(true);
  });

  it('jogada que forma três iguais na coluna é recusada', () => {
    const g = vazia();
    g[0][2] = 1; g[1][2] = 1;
    const jogo = new SudokuBinario(g);
    expect(jogo.jogar(2, 2, 1)).toBe(false);
    expect(jogo.grade[2][2]).toBe(VAZIO);
  });
});

describe('Regra: linhas e colunas não podem se repetir', () => {
  it('recusa jogada que completa uma linha igual a outra', () => {
    const g = vazia();
    g[0] = [0, 0, 1, 0, 1, 1];
    g[1] = [0, 0, 1, 0, 1, VAZIO];
    const jogo = new SudokuBinario(g);
    expect(jogo.jogar(1, 5, 1)).toBe(false);
  });

  it('recusa jogada que completa uma coluna igual a outra', () => {
    const g = vazia();
    [0, 1, 1, 0, 0, 1].forEach((v, l) => { g[l][0] = v; });
    [0, 1, 1, 0, 0].forEach((v, l) => { g[l][1] = v; });
    const jogo = new SudokuBinario(g);
    expect(jogo.jogar(5, 1, 1)).toBe(false);
  });

  it('linhas incompletas iguais ainda são permitidas', () => {
    const g = vazia();
    g[0] = [0, 1, VAZIO, VAZIO, VAZIO, VAZIO];
    g[1] = [0, 1, VAZIO, VAZIO, VAZIO, VAZIO];
    expect(() => new SudokuBinario(g)).not.toThrow();
  });
});

describe('Jogadas', () => {
  it('jogada válida preenche a célula', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    expect(jogo.jogar(0, 0, 0)).toBe(true);
    expect(jogo.grade[0][0]).toBe(0);
  });

  it('não permite alterar célula fixa', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    expect(() => jogo.jogar(0, 4, 0)).toThrow(/fixa/);
    expect(() => jogo.limpar(0, 4)).toThrow(/fixa/);
  });

  it('só aceita 0 ou 1', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    expect(() => jogo.jogar(0, 0, 2)).toThrow(/0 ou 1/);
    expect(() => jogo.jogar(0, 0, '1')).toThrow(/0 ou 1/);
  });

  it('posição fora da grade gera erro', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    expect(() => jogo.jogar(6, 0, 1)).toThrow(RangeError);
    expect(() => jogo.jogar(0, -1, 1)).toThrow(RangeError);
  });

  it('limpar esvazia a célula', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    jogo.jogar(0, 0, 0);
    jogo.limpar(0, 0);
    expect(jogo.grade[0][0]).toBe(VAZIO);
  });

  it('jogada recusada mantém o valor anterior', () => {
    const g = vazia();
    g[0][0] = 1; g[0][1] = 1;
    const jogo = new SudokuBinario(g);
    jogo.jogar(0, 2, 0);
    expect(jogo.jogar(0, 2, 1)).toBe(false);
    expect(jogo.grade[0][2]).toBe(0);
  });
});

describe('Fim de jogo', () => {
  it('grade inicial não está completa nem resolvida', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    expect(jogo.completo()).toBe(false);
    expect(jogo.resolvido()).toBe(false);
  });

  it('a solução conhecida é reconhecida como resolvida', () => {
    expect(SudokuBinario.deTexto(SOLUCAO).resolvido()).toBe(true);
  });

  it('preenchendo a solução jogada a jogada, o jogo termina resolvido', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    const sol = lerGrade(SOLUCAO);
    for (let l = 0; l < 6; l++) {
      for (let c = 0; c < 6; c++) {
        if (!jogo.fixas[l][c]) expect(jogo.jogar(l, c, sol[l][c])).toBe(true);
      }
    }
    expect(jogo.resolvido()).toBe(true);
  });

  it('grade completa com regra violada não é solução', () => {
    // Copia a linha 1 sobre a linha 0: a grade fica cheia, mas com duas linhas iguais.
    const errada = lerGrade(SOLUCAO);
    errada[0] = [...errada[1]];
    const jogo = new SudokuBinario(vazia());
    jogo.grade = errada;
    expect(jogo.completo()).toBe(true);
    expect(jogo.resolvido()).toBe(false);
  });
});

describe('Resolvedor', () => {
  it('resolve o quebra-cabeça e chega à solução esperada', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    expect(jogo.resolver()).toBe(true);
    expect(jogo.paraTexto()).toBe(lerGrade(SOLUCAO).map((l) => l.join('')).join('\n'));
  });

  it('o quebra-cabeça tem solução única', () => {
    expect(SudokuBinario.deTexto(PUZZLE).contarSolucoes()).toBe(1);
  });

  it('não altera as pistas fixas ao resolver', () => {
    const jogo = SudokuBinario.deTexto(PUZZLE);
    jogo.resolver();
    expect(jogo.grade[0][4]).toBe(1);
    expect(jogo.grade[4][0]).toBe(1);
  });

  it('retorna false quando não há solução', () => {
    // As linhas 0 e 1 já têm três 0: a última célula das duas só pode ser 1,
    // o que deixaria duas linhas iguais (001011). Não existe solução.
    const g = lerGrade(`
      00101.
      00101.
      ......
      ......
      ......
      ......
    `);
    const jogo = new SudokuBinario(g);
    expect(jogo.resolver()).toBe(false);
    expect(jogo.contarSolucoes()).toBe(0);
  });

  it('a grade 6 x 6 vazia tem exatamente 4140 soluções', () => {
    expect(new SudokuBinario(vazia()).contarSolucoes(Infinity)).toBe(4140);
  });
});
