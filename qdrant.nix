{ pkgs ? import <nixpkgs> { } }:

let
  qdrantVersion = "1.7.4";
  qdrantPort = 6333;
  qdrantDataDir = "./storage";
in
pkgs.mkShell {
  name = "qdrant-dev-env";

  buildInputs = with pkgs; [
    qdrant
  ];

  shellHook = ''
    echo "🚀 Qdrant 开发环境"
    echo "================================"
    echo "Qdrant 版本: ${qdrantVersion}"
    echo "HTTP 端口: ${toString qdrantPort}"
    echo "gRPC 端口: 6334"
    echo "数据目录: ${qdrantDataDir}"
    echo "================================"
    echo ""
    echo "使用以下命令启动 Qdrant:"
    echo "  start-qdrant    - 启动 Qdrant 服务"
    echo "  check-qdrant    - 检查 Qdrant 状态"
    echo "  stop-qdrant     - 停止 Qdrant 服务"
    echo ""

    mkdir -p ${qdrantDataDir}

    start-qdrant() {
      echo "正在启动 Qdrant..."
      qdrant --config-path <(cat <<EOF
service:
  host: 0.0.0.0
  http_port: ${toString qdrantPort}
  grpc_port: 6334

storage:
  storage_path: ${qdrantDataDir}
  snapshots_path: ${qdrantDataDir}/snapshots

log_level: INFO
EOF
) &
      echo "Qdrant 已在后台启动"
      echo "Web UI: http://localhost:${toString qdrantPort}/dashboard"
      echo "API: http://localhost:${toString qdrantPort}"
    }

    check-qdrant() {
      echo "检查 Qdrant 状态..."
      curl -s http://localhost:${toString qdrantPort}/healthz | jq '.' || echo "Qdrant 未运行或无法连接"
    }

    stop-qdrant() {
      echo "正在停止 Qdrant..."
      pkill -f qdrant || echo "没有运行中的 Qdrant 进程"
    }

    export -f start-qdrant
    export -f check-qdrant
    export -f stop-qdrant
  '';

  QDRANT_HOST = "localhost";
  QDRANT_PORT = toString qdrantPort;
  QDRANT_GRPC_PORT = "6334";
  QDRANT_DATA_DIR = qdrantDataDir;
}
