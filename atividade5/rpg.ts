// para rodar, usar deno --allow-read --allow-write jogo.ts

import {
  existsSync,
  readFileSync,
  writeFileSync
} from "node:fs";

import {
  createInterface
} from "node:readline/promises";

import {
  stdin as input,
  stdout as output
} from "node:process";

// ============================================================
// PERSONAGEM
// ============================================================

class Personagem {
  private vida: number;
  private experiencia = 0;

  constructor(
    public readonly nome: string,
    private readonly vidaMaxima: number,
    private readonly dano: number
  ) {
    this.vida = vidaMaxima;
  }

  getVida(): number {
    return this.vida;
  }

  getVidaMaxima(): number {
    return this.vidaMaxima;
  }

  getDano(): number {
    return this.dano;
  }

  getExperiencia(): number {
    return this.experiencia;
  }

  getNivel(): number {
    if (this.experiencia >= 500) return 4;
    if (this.experiencia >= 250) return 3;
    if (this.experiencia >= 100) return 2;

    return 1;
  }

  estaVivo(): boolean {
    return this.vida > 0;
  }

  atacar(outro: Personagem): void {
    if (!this.estaVivo()) {
      console.log(
        `${this.nome} está morto e não pode atacar.`
      );
      return;
    }

    if (!outro.estaVivo()) {
      console.log(
        `${outro.nome} já está morto.`
      );
      return;
    }

    outro.receberDano(this.dano);

    console.log(
      `${this.nome} atacou ${outro.nome} ` +
      `causando ${this.dano} de dano.`
    );
  }

  receberDano(dano: number): void {
    this.vida = Math.max(
      0,
      this.vida - dano
    );
  }

  curar(quantidade: number): void {
    this.vida = Math.min(
      this.vidaMaxima,
      this.vida + quantidade
    );
  }

  ganharExperiencia(quantidade: number): void {
    this.experiencia += quantidade;

    console.log(
      `${this.nome} ganhou ${quantidade} XP.`
    );
  }

  restaurarEstado(
    vida: number,
    experiencia: number
  ): void {
    this.vida = vida;
    this.experiencia = experiencia;
  }
}

// ============================================================
// REPOSITORY
// ============================================================

interface JogoRepository {
  salvar(jogo: Jogo): number;
  carregar(indice: number): Jogo;
  listar(): JogoData[];
  existe(): boolean;
}

// ============================================================
// DADOS PERSISTIDOS
// ============================================================

interface PersonagemData {
  nome: string;
  vida: number;
  vidaMaxima: number;
  dano: number;
  experiencia: number;
}

interface JogoData {
  personagens: PersonagemData[];
}

// ============================================================
// JSON REPOSITORY
// ============================================================

class JsonJogoRepository implements JogoRepository {
  constructor(
    private readonly arquivo: string
  ) {}

  existe(): boolean {
    return existsSync(this.arquivo);
  }

  private lerJogos(): JogoData[] {
    if (!this.existe()) {
      return [];
    }

    const json = readFileSync(
      this.arquivo,
      "utf-8"
    );

    const dados = JSON.parse(json);

    // Se o arquivo já estiver no novo formato
    // com vários jogos
    if (Array.isArray(dados)) {
      return dados;
    }

    // Se estiver no formato antigo,
    // transforma o único jogo em um array
    return [dados];
  }

  salvar(jogo: Jogo): number {
    const jogos = this.lerJogos();

    const dados: JogoData = {
      personagens: jogo.listarPersonagens()
        .map(personagem => ({
          nome: personagem.nome,
          vida: personagem.getVida(),
          vidaMaxima: personagem.getVidaMaxima(),
          dano: personagem.getDano(),
          experiencia: personagem.getExperiencia()
        }))
    };

    jogos.push(dados);

    const json = JSON.stringify(
      jogos,
      null,
      2
    );

    writeFileSync(
      this.arquivo,
      json,
      "utf-8"
    );

    return jogos.length - 1;
  }

  listar(): JogoData[] {
    return this.lerJogos();
  }

  carregar(indice: number): Jogo {
    const jogos = this.lerJogos();

    if (
      indice < 0 ||
      indice >= jogos.length
    ) {
      throw new Error(
        "Índice de partida inválido."
      );
    }

    const dados = jogos[indice];

    const jogo = new Jogo();

    for (const personagemData of dados.personagens) {
      const personagem = new Personagem(
        personagemData.nome,
        personagemData.vidaMaxima,
        personagemData.dano
      );

      personagem.restaurarEstado(
        personagemData.vida,
        personagemData.experiencia
      );

      jogo.adicionarPersonagem(personagem);
    }

    return jogo;
  }
}

// ============================================================
// JOGO
// ============================================================

class Jogo {
  private readonly personagens: Personagem[] = [];

  adicionarPersonagem(
    personagem: Personagem
  ): void {
    this.personagens.push(personagem);
  }

  listarPersonagens(): readonly Personagem[] {
    return [...this.personagens];
  }

  encontrarPersonagem(
    nome: string
  ): Personagem | undefined {
    return this.personagens.find(
      personagem =>
        personagem.nome === nome
    );
  }
}

// ============================================================
// INTERFACE DO JOGO
// ============================================================

class InterfaceJogo {
  constructor(
    private readonly readline:
      ReturnType<typeof createInterface>,

    private readonly repository: JogoRepository
  ) {}

  async executar(): Promise<void> {
    let executando = true;

    while (executando) {
      console.log(`
==============================
             RPG
==============================

1. Nova partida
2. Carregar partida
3. Sair
`);

      const opcao =
        await this.readline.question(
          "Escolha uma opção: "
        );

      switch (opcao) {
        case "1":
          await this.novaPartida();
          break;

        case "2":
          await this.carregarPartida();
          break;

        case "3":
          executando = false;

          console.log(
            "Até a próxima!"
          );

          break;

        default:
          console.log(
            "Opção inválida."
          );
      }
    }
  }

  private async novaPartida(): Promise<void> {
    console.log(`
==============================
         NOVA PARTIDA
==============================
`);

    const jogo = new Jogo();

    const aragorn =
      new Personagem(
        "Aragorn",
        100,
        20
      );

    const gandalf =
      new Personagem(
        "Gandalf",
        80,
        30
      );

    jogo.adicionarPersonagem(aragorn);
    jogo.adicionarPersonagem(gandalf);

    console.log(
      "Nova partida criada."
    );

    await this.executarPartida(jogo);
  }

  private async carregarPartida(): Promise<void> {
    if (!this.repository.existe()) {
      console.log(
        "\nNenhuma partida salva foi encontrada."
      );

      return;
    }

    const jogos = this.repository.listar();

    if (jogos.length === 0) {
      console.log(
        "\nNenhuma partida salva foi encontrada."
      );

      return;
    }

    console.log(`
==============================
       PARTIDAS SALVAS
==============================
`);

    for (let i = 0; i < jogos.length; i++) {
      console.log(
        `[${i}] Partida ${i}`
      );

      for (const personagem of jogos[i].personagens) {
        console.log(
          `    ${personagem.nome} | ` +
          `Vida: ${personagem.vida}/` +
          `${personagem.vidaMaxima} | ` +
          `Nível: ${this.calcularNivel(personagem.experiencia)} | ` +
          `XP: ${personagem.experiencia}`
        );
      }

      console.log("");
    }

    const indiceTexto =
      await this.readline.question(
        "Digite o índice da partida: "
      );

    const indice = Number(indiceTexto);

    if (
      !Number.isInteger(indice) ||
      indice < 0 ||
      indice >= jogos.length
    ) {
      console.log(
        "Índice inválido."
      );

      return;
    }

    try {
      const jogo =
        this.repository.carregar(indice);

      console.log(
        `\nPartida ${indice} carregada com sucesso!`
      );

      await this.executarPartida(jogo);

    } catch (erro) {
      console.log(
        "\nNão foi possível carregar a partida."
      );

      console.error(erro);
    }
  }

  private calcularNivel(experiencia: number): number {
    if (experiencia >= 500) return 4;
    if (experiencia >= 250) return 3;
    if (experiencia >= 100) return 2;

    return 1;
  }

  private async executarPartida(
    jogo: Jogo
  ): Promise<void> {
    let continuar = true;

    while (continuar) {
      console.log(`
==============================
           PARTIDA
==============================

1. Listar personagens
2. Atacar
3. Ganhar experiência
4. Curar
5. Salvar partida
6. Voltar
`);

      const opcao =
        await this.readline.question(
          "Escolha uma opção: "
        );

      switch (opcao) {
        case "1":
          this.listarPersonagens(jogo);
          break;

        case "2":
          await this.atacar(jogo);
          break;

        case "3":
          await this.ganharExperiencia(jogo);
          break;

        case "4":
          await this.curar(jogo);
          break;

        case "5":
          const indice =
            this.repository.salvar(jogo);

          console.log(
            `\nPartida salva no índice ${indice}!`
          );

          break;

        case "6":
          continuar = false;
          break;

        default:
          console.log(
            "Opção inválida."
          );
      }
    }
  }

  private listarPersonagens(
    jogo: Jogo
  ): void {
    console.log(
      "\nPersonagens:"
    );

    for (
      const personagem of
      jogo.listarPersonagens()
    ) {
      console.log(
        `- ${personagem.nome} | ` +
        `Vida: ${personagem.getVida()}/` +
        `${personagem.getVidaMaxima()} | ` +
        `Nível: ${personagem.getNivel()} | ` +
        `XP: ${personagem.getExperiencia()}`
      );
    }
  }

  private async atacar(
    jogo: Jogo
  ): Promise<void> {
    const atacanteNome =
      await this.readline.question(
        "Quem vai atacar? "
      );

    const alvoNome =
      await this.readline.question(
        "Quem será atacado? "
      );

    const atacante =
      jogo.encontrarPersonagem(
        atacanteNome
      );

    const alvo =
      jogo.encontrarPersonagem(
        alvoNome
      );

    if (!atacante || !alvo) {
      console.log(
        "Personagem não encontrado."
      );

      return;
    }

    atacante.atacar(alvo);
  }

  private async ganharExperiencia(
    jogo: Jogo
  ): Promise<void> {
    const nome =
      await this.readline.question(
        "Personagem: "
      );

    const personagem =
      jogo.encontrarPersonagem(nome);

    if (!personagem) {
      console.log(
        "Personagem não encontrado."
      );

      return;
    }

    const quantidadeTexto =
      await this.readline.question(
        "Quantidade de XP: "
      );

    const quantidade =
      Number(quantidadeTexto);

    if (
      !Number.isFinite(quantidade) ||
      quantidade <= 0
    ) {
      console.log(
        "Quantidade inválida."
      );

      return;
    }

    personagem.ganharExperiencia(
      quantidade
    );
  }

  private async curar(
    jogo: Jogo
  ): Promise<void> {
    const nome =
      await this.readline.question(
        "Personagem: "
      );

    const personagem =
      jogo.encontrarPersonagem(nome);

    if (!personagem) {
      console.log(
        "Personagem não encontrado."
      );

      return;
    }

    const quantidadeTexto =
      await this.readline.question(
        "Quantidade de cura: "
      );

    const quantidade =
      Number(quantidadeTexto);

    if (
      !Number.isFinite(quantidade) ||
      quantidade <= 0
    ) {
      console.log(
        "Quantidade inválida."
      );

      return;
    }

    personagem.curar(quantidade);

    console.log(
      `${personagem.nome} agora possui ` +
      `${personagem.getVida()} HP.`
    );
  }
}

// ============================================================
// PROGRAMA
// ============================================================

const readline =
  createInterface({
    input,
    output
  });

const repository =
  new JsonJogoRepository("jogo.json");

const interfaceJogo =
  new InterfaceJogo(
    readline,
    repository
  );

await interfaceJogo.executar();

readline.close();
