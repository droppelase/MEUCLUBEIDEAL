from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os
import uuid

app = Flask(__name__)
CORS(app, origins="*", allow_headers=["Content-Type", "Authorization"], supports_credentials=True)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'images')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload():
    if 'imagem' not in request.files:
        return jsonify({'erro': 'Nenhum arquivo enviado'}), 400

    file = request.files['imagem']
    if file.filename == '':
        return jsonify({'erro': 'Nome de arquivo vazio'}), 400

    filename = file.filename
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)

    return jsonify({"caminho": f"/static/images/{filename}"})

@app.route('/static/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Funções auxiliares
def load_data(file_path):
    if not os.path.exists(file_path):
        return []
    with open(file_path, 'r') as f:
        try:
            return json.load(f)
        except:
            return []

def save_data(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

@app.route('/')
def home():
    return {'mensagem': 'API do Clube de Benefícios no ar!'}

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')
    nome = data.get('nome')
    sobrenome = data.get('sobrenome')
    data_nascimento = data.get('data_nascimento')  # Campo para data de nascimento
    telefone = data.get('telefone')
    cpf = data.get('cpf')
    repetirSenha = data.get('repetirSenha')

    # Verifica se todos os campos obrigatórios foram preenchidos
    if not email or not senha or not nome or not sobrenome or not data_nascimento or not telefone or not cpf or not repetirSenha:
        return jsonify({'erro': 'Todos os campos são obrigatórios'}), 400

    # Verifica se as senhas coincidem
    if senha != repetirSenha:
        return jsonify({'erro': 'As senhas não coincidem'}), 400

    # Validação de CPF simples
    if len(cpf) != 11 or not cpf.isdigit():
        return jsonify({'erro': 'CPF inválido'}), 400

    # Validação de email
    if "@" not in email:
        return jsonify({'erro': 'Email inválido'}), 400

    with open('data/users.json', 'r+') as f:
        users = json.load(f)

        # Verifica se o email já está cadastrado
        if any(u['email'] == email for u in users):
            return jsonify({'erro': 'Email já cadastrado'}), 409

        # Adiciona os dados do novo usuário
        novo_usuario = {
            'email': email,
            'senha': senha,
            'nome': nome,
            'sobrenome': sobrenome,
            'data_nascimento': data_nascimento,
            'telefone': telefone,
            'cpf': cpf,
            'data_cadastro': datetime.now().isoformat(),
            'tipo': 'cliente'
        }

        users.append(novo_usuario)
        f.seek(0)
        json.dump(users, f, indent=2)
        f.truncate()

    return jsonify({'mensagem': 'Usuário cadastrado com sucesso'}), 201

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    users = load_data('data/users.json')

    for user in users:
        print(f"Verificando usuário: {user['email']}")  # Debug
        if user['email'] == data['email'] and user['senha'] == data['senha']:
            print(f"Tipo de usuário encontrado: {user['tipo']}")  # Debug
            return jsonify({
                'mensagem': 'Login bem-sucedido',
                'userRole': user['tipo']  # Retorna o tipo de usuário (admin ou cliente)
            })

    return jsonify({'erro': 'Credenciais inválidas'}), 401

# Vouchers disponíveis
@app.route('/vouchers', methods=['GET'])
def get_vouchers():
    from datetime import datetime
    vouchers = load_data('data/vouchers.json')
    hoje = datetime.now().date()

    validos = []
    for v in vouchers:
        validade_str = v.get('validade', '')
        try:
            validade_data = datetime.strptime(validade_str, '%Y-%m-%d').date()
            if validade_data >= hoje:
                validos.append(v)
        except ValueError:
            continue

    return jsonify(validos)

# Editar/excluir voucher
@app.route('/admin/vouchers/<int:voucher_id>', methods=['PUT', 'DELETE'])
def gerenciar_voucher(voucher_id):
    vouchers = load_data('data/vouchers.json')

    if request.method == 'PUT':
        dados = request.get_json()
        atualizado = False

        for v in vouchers:
            if v['id'] == voucher_id:
                v['parceiro'] = dados.get('parceiro', v['parceiro'])
                v['descricao'] = dados.get('descricao', v['descricao'])
                v['validade'] = dados.get('validade', v['validade'])
                v['codigo'] = dados.get('codigo', v['codigo'])
                v['imagem'] = dados.get('imagem', v.get('imagem', ''))
                atualizado = True
                break

        if not atualizado:
            return jsonify({'erro': 'Voucher não encontrado'}), 404

        save_data('data/vouchers.json', vouchers)
        return jsonify({'mensagem': 'Voucher atualizado com sucesso!'})

    elif request.method == 'DELETE':
        novo_lista = [v for v in vouchers if v['id'] != voucher_id]

        if len(novo_lista) == len(vouchers):
            return jsonify({'erro': 'Voucher não encontrado'}), 404

        save_data('data/vouchers.json', novo_lista)
        return jsonify({'mensagem': 'Voucher excluído com sucesso!'})

# Resgatar voucher
@app.route('/resgatar', methods=['POST'])
def resgatar():
    dados = request.get_json()
    email = dados.get('email')
    voucher_id = dados.get('voucher_id')

    vouchers = load_data('data/vouchers.json')
    voucher = next((v for v in vouchers if v['id'] == voucher_id), None)

    if not voucher:
        return jsonify({"erro": "Voucher não encontrado"}), 404

    data_hora = datetime.now().isoformat()
    codigo_unico = str(uuid.uuid4())

    novo_resgate = {
        "email": email,
        "voucher_id": voucher_id,
        "data_hora": data_hora,
        "codigo": codigo_unico,
        "usado": False,
        "parceiro": voucher['parceiro'],
        "valido_ate": (datetime.now() + timedelta(hours=24)).isoformat()  # Validade de 24h
    }

    resgates = load_data('data/resgates.json')

    if any(r["email"] == email and r["voucher_id"] == voucher_id for r in resgates):
        return jsonify({"erro": "Você já resgatou esse voucher."}), 400

    resgates.append(novo_resgate)
    save_data('data/resgates.json', resgates)

    return jsonify({
        "mensagem": "Resgate registrado com sucesso!",
        "codigo": codigo_unico,
        "valido_ate": novo_resgate['valido_ate']  # Opcional: enviar para frontend
    }), 200

# Admin - Listar vouchers
@app.route('/admin/vouchers', methods=['GET'])
def listar_vouchers_admin():
    vouchers = load_data('data/vouchers.json')
    return jsonify(vouchers)

# Admin - Adicionar voucher
@app.route('/admin/vouchers', methods=['POST'])
def adicionar_voucher():
    dados = request.get_json()
    vouchers = load_data('data/vouchers.json')

    novo_id = max((v['id'] for v in vouchers), default=0) + 1

    novo_voucher = {
        "id": novo_id,
        "parceiro": dados.get("parceiro"),
        "descricao": dados.get("descricao"),
        "validade": dados.get("validade"),
        "codigo": dados.get("codigo"),
        "imagem": dados.get("imagem", '')
    }

    vouchers.append(novo_voucher)
    save_data('data/vouchers.json', vouchers)

    return jsonify({"mensagem": "Voucher adicionado com sucesso!"})

# Admin - Estatísticas
@app.route('/admin/estatisticas')
def estatisticas():
    resgates = load_data('data/resgates.json')
    vouchers = load_data('data/vouchers.json')

    total = len(resgates)
    resgates_por_voucher = {}

    for r in resgates:
        vid = r['voucher_id']
        if vid not in resgates_por_voucher:
            resgates_por_voucher[vid] = 0
        resgates_por_voucher[vid] += 1

    por_voucher = []
    for v in vouchers:
        vid = v['id']
        if vid in resgates_por_voucher:
            por_voucher.append({
                "parceiro": v['parceiro'],
                "resgates": resgates_por_voucher[vid]
            })

    return jsonify({
        "total": total,
        "por_voucher": por_voucher
    })

# Rota para perfil do usuário (resgates feitos por ele)
@app.route('/usuario/resgates')
def resgates_do_usuario():
    email = request.args.get('email')
    resgates = load_data('data/resgates.json')
    vouchers = load_data('data/vouchers.json')

    resgatados = []
    for r in resgates:
        if r['email'] == email:
            voucher = next((v for v in vouchers if v['id'] == r['voucher_id']), None)
            if voucher:
                resgatados.append({
                    "parceiro": voucher['parceiro'],
                    "descricao": voucher['descricao'],
                    "validade": voucher['validade'],
                    "codigo": voucher['codigo'],
                    "data_resgate": r['data_hora']
                })

    return jsonify(resgatados)

@app.route('/admin/usuarios', methods=['GET'])
def listar_usuarios():
    try:
        with open('data/users.json', 'r', encoding='utf-8') as f:
            usuarios = json.load(f)
        return jsonify(usuarios)
    except Exception as e:
        return jsonify({'erro': 'Erro ao carregar usuários', 'detalhes': str(e)}), 500

@app.route('/admin/usuarios/tipo', methods=['PUT'])
def atualizar_tipo_usuario():
    dados = request.get_json()
    email = dados.get('email')
    novo_tipo = dados.get('tipo')

    if not email or not novo_tipo:
        return jsonify({'erro': 'Email e tipo são obrigatórios'}), 400

    usuarios = load_data('data/users.json')
    atualizado = False

    for usuario in usuarios:
        if usuario['email'] == email:
            usuario['tipo'] = novo_tipo
            atualizado = True
            break

    if not atualizado:
        return jsonify({'erro': 'Usuário não encontrado'}), 404

    save_data('data/users.json', usuarios)
    return jsonify({'mensagem': 'Tipo de usuário atualizado com sucesso!'})

# CRUD de Parceiros

# Listar parceiros
@app.route('/admin/parceiros', methods=['GET'])
def listar_parceiros():
    parceiros = load_data('data/parceiros.json')
    return jsonify(parceiros)

# Adicionar parceiro
@app.route('/admin/parceiros', methods=['POST'])
def adicionar_parceiro():
    dados = request.get_json()
    
    # Obter os dados da empresa
    nome = dados.get('nome')
    email = dados.get('email')
    cnpj = dados.get('cnpj')
    nome_responsavel = dados.get('nome_responsavel')
    telefone = dados.get('telefone')

    if not nome or not email:
        return jsonify({'erro': 'Nome e email são obrigatórios'}), 400

    parceiros = load_data('data/parceiros.json')
    novo_id = max((p['id'] for p in parceiros), default=0) + 1

    novo_parceiro = {
        "id": novo_id,
        "nome": nome,
        "email": email,
        "cnpj": cnpj,
        "nome_responsavel": nome_responsavel,
        "telefone": telefone
    }

    parceiros.append(novo_parceiro)
    save_data('data/parceiros.json', parceiros)

    return jsonify({"mensagem": "Parceiro cadastrado com sucesso!", "parceiro": novo_parceiro})

# Editar parceiro
@app.route('/admin/parceiros/<int:parceiro_id>', methods=['PUT'])
def editar_parceiro(parceiro_id):
    dados = request.get_json()
    parceiros = load_data('data/parceiros.json')
    atualizado = False

    for p in parceiros:
        if p['id'] == parceiro_id:
            p['nome'] = dados.get('nome', p['nome'])
            p['email'] = dados.get('email', p['email'])
            p['cnpj'] = dados.get('cnpj', p['cnpj'])
            p['nome_responsavel'] = dados.get('nome_responsavel', p['nome_responsavel'])
            p['telefone'] = dados.get('telefone', p['telefone'])
            atualizado = True
            break

    if not atualizado:
        return jsonify({'erro': 'Parceiro não encontrado'}), 404

    save_data('data/parceiros.json', parceiros)
    return jsonify({'mensagem': 'Parceiro atualizado com sucesso!'})

# Excluir parceiro
@app.route('/admin/parceiros/<int:parceiro_id>', methods=['DELETE'])
def excluir_parceiro(parceiro_id):
    parceiros = load_data('data/parceiros.json')
    parceiros = [p for p in parceiros if p['id'] != parceiro_id]
    save_data('data/parceiros.json', parceiros)
    return jsonify({'mensagem': 'Parceiro excluído com sucesso!'})

# Validar Voucher
@app.route('/parceiro/validar', methods=['POST', 'OPTIONS'])
def validar_voucher():
    if request.method == 'OPTIONS':
        return _build_cors_response()

    try:
        dados = request.get_json()
        codigo = dados.get('codigo')
        parceiro_nome = dados.get('parceiro')

        if not codigo or not parceiro_nome:
            return jsonify({"erro": "Dados incompletos"}), 400

        resgates = load_data('data/resgates.json')
        vouchers = load_data('data/vouchers.json')
        parceiros = load_data('data/parceiros.json')

        # Encontrar o resgate correspondente
        resgate = next((r for r in resgates if r.get('codigo') == codigo), None)
        if not resgate:
            return _cors_json({"erro": "Código inválido"}, 404)

        # Verificar validade
        if resgate.get('valido_ate') and datetime.now() > datetime.fromisoformat(resgate['valido_ate']):
            return _cors_json({"erro": "Voucher expirado"}, 410)

        if resgate.get('usado'):
            return _cors_json({"mensagem": "Voucher já utilizado"}, 200)

        # Verificar correspondência com parceiro
        voucher = next((v for v in vouchers if v['id'] == resgate['voucher_id']), None)
        if not voucher or voucher['parceiro'] != parceiro_nome:
            return _cors_json({"erro": "Voucher não pertence a este parceiro"}, 403)

        # Atualizar resgate
        resgate['usado'] = True
        resgate['data_validacao'] = datetime.now().isoformat()

        # Atualizar métricas
        parceiro = next((p for p in parceiros if p['nome'] == parceiro_nome), None)
        if parceiro:
            parceiro['total_validados'] = sum(1 for r in resgates if r.get('parceiro') == parceiro_nome and r.get('usado'))
            parceiro['total_resgates'] = sum(1 for r in resgates if r.get('parceiro') == parceiro_nome)
            save_data('data/parceiros.json', parceiros)

        save_data('data/resgates.json', resgates)

        return _cors_json({
            "mensagem": "Validação realizada com sucesso",
            "metricas": {
                "total_validados": parceiro['total_validados'],
                "total_resgates": parceiro['total_resgates']
            }
        })

    except Exception as e:
        print(f'Erro na validação: {str(e)}')
        return _cors_json({"erro": "Falha interna no servidor"}, 500)

def _cors_json(response, status=200):
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response, status

def _build_cors_response():
    response = jsonify()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response

# Métricas do parceiro
@app.route('/parceiro/metricas', methods=['GET'])
def obter_metricas():
    parceiro_nome = request.args.get('parceiro')  # Usando o nome ou identificador do parceiro
    resgates = load_data('data/resgates.json')
    vouchers = load_data('data/vouchers.json')

    # Encontrar os vouchers do parceiro
    vouchers_do_parceiro = [v for v in vouchers if v['parceiro'] == parceiro_nome]

    # Contar quantos resgates foram feitos e quantos foram validados
    total_resgates = 0
    total_validados = 0

    for v in vouchers_do_parceiro:
        for resgate in resgates:
            if resgate['voucher_id'] == v['id']:
                total_resgates += 1
                if resgate['usado']:
                    total_validados += 1

    return jsonify({
        'total_resgates': total_resgates,
        'total_validados': total_validados,
        'total_vouchers': len(vouchers_do_parceiro),
    })

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
    return response


if __name__ == '__main__':
    app.run(debug=True, port=5000)
