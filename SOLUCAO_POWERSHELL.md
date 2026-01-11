# 🔧 Solução: Problema de Execução de Scripts no PowerShell

Se você está recebendo o erro:
```
npm : O arquivo C:\Program Files\nodejs\npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada
```

## ✅ Soluções Rápidas

### Opção 1: Usar o arquivo .bat (Mais Fácil) ⭐

Use o arquivo `start-frontend.bat` que acabei de criar:

```bash
cd project
start-frontend.bat
```

Ou simplesmente **dê duplo clique** no arquivo `start-frontend.bat` dentro da pasta `project`.

### Opção 2: Mudar Política de Execução (Temporária)

Execute no PowerShell **como Administrador**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois rode:
```bash
npm run dev
```

### Opção 3: Mudar Política de Execução (Permanente)

Execute no PowerShell **como Administrador**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

⚠️ **Atenção**: Isso requer permissões de administrador.

### Opção 4: Usar cmd (Prompt de Comando) ao invés de PowerShell

1. Abra o **Prompt de Comando** (cmd) ao invés do PowerShell
2. Navegue até a pasta: `cd project`
3. Execute: `npm run dev`

### Opção 5: Bypass apenas para esse comando

```powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

---

## 🚀 Solução Recomendada: Scripts Automáticos

Eu criei scripts para facilitar:

### Para Windows:
```bash
# Na raiz do projeto
start.bat
```

### Para iniciar só o frontend:
```bash
cd project
start-frontend.bat
```

### Para iniciar só o backend:
```bash
cd backend
python main.py
```

---

## 📝 Explicação

O PowerShell do Windows tem políticas de segurança que bloqueiam a execução de scripts por padrão. Isso é uma medida de segurança, mas impede que o npm funcione diretamente.

**A solução mais simples é usar os arquivos .bat** que não são afetados por essa política!

---

## ✅ Status

Se o frontend já está rodando, você pode acessar:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000


