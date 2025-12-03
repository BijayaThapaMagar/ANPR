#!/bin/bash

# ANPR System Deployment Script
# This script deploys the entire ANPR system using Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p anpr-backend/models
    mkdir -p anpr-backend/results
    mkdir -p anpr-backend/temp
    
    print_success "Directories created"
}

# Function to check model files
check_models() {
    print_status "Checking model files..."
    
    if [ ! -f "anpr-backend/models/license_plate_detector.pt" ]; then
        print_warning "License plate detector model not found at anpr-backend/models/license_plate_detector.pt"
        print_warning "Please ensure you have the required model files before deployment"
    fi
    
    if [ ! -f "anpr-backend/models/character_detector.pt" ]; then
        print_warning "Character detector model not found at anpr-backend/models/character_detector.pt"
        print_warning "Please ensure you have the required model files before deployment"
    fi
    
    print_success "Model files checked"
}

# Function to build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Stop any existing containers
    docker-compose down --remove-orphans
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Services deployed successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for MongoDB
    print_status "Waiting for MongoDB..."
    until docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        sleep 2
    done
    print_success "MongoDB is ready"
    
    # Wait for Backend
    print_status "Waiting for Backend..."
    until curl -f http://localhost:8000/ > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Backend is ready"
    
    # Wait for Frontend
    print_status "Waiting for Frontend..."
    until curl -f http://localhost:5173/ > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Frontend is ready"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo -e "  ${GREEN}Frontend:${NC} http://localhost:5173"
    echo -e "  ${GREEN}Backend API:${NC} http://localhost:8000"
    echo -e "  ${GREEN}Backend Health:${NC} http://localhost:8000/"
    echo -e "  ${GREEN}MongoDB:${NC} localhost:27017"
}

# Function to show logs
show_logs() {
    print_status "Recent logs:"
    docker-compose logs --tail=20
}

# Main deployment function
main() {
    echo "🚗 ANPR System Deployment"
    echo "=========================="
    echo ""
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Create directories
    create_directories
    
    # Check model files
    check_models
    
    # Deploy services
    deploy_services
    
    # Wait for services
    wait_for_services
    
    # Show status
    show_status
    
    echo ""
    print_success "ANPR System deployed successfully!"
    echo ""
    print_status "You can now access the system at:"
    echo -e "  ${GREEN}Frontend:${NC} http://localhost:5173"
    echo -e "  ${GREEN}Backend API:${NC} http://localhost:8000"
    echo ""
    print_status "To view logs, run: ${YELLOW}docker-compose logs -f${NC}"
    print_status "To stop services, run: ${YELLOW}docker-compose down${NC}"
}

# Function to show help
show_help() {
    echo "ANPR System Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy    Deploy the entire ANPR system (default)"
    echo "  status    Show service status"
    echo "  logs      Show service logs"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  help      Show this help message"
    echo ""
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        print_status "Stopping services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 