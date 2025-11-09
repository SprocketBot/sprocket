# Image Generation Service

## Overview
The Image Generation Service is a NestJS-based microservice responsible for generating dynamic images from SVG templates with data substitution. It processes SVG templates containing placeholder elements and replaces them with actual data to create customized images for various use cases within the Sprocket platform.

## Architecture
- **Framework**: NestJS with TypeScript
- **Transport**: RabbitMQ (RMQ)
- **Image Processing**: Sharp.js for image manipulation
- **DOM Manipulation**: JSDOM for SVG parsing and manipulation
- **Storage**: MinIO for file storage
- **Communication**: gRPC-style message patterns

## Core Functionality

### SVG Template Processing
The service processes SVG templates that contain special data attributes (`data-sprocket`) which define how elements should be transformed. The template system supports:

- **Text Substitution**: Replace text elements with dynamic content
- **Image Replacement**: Swap image elements with dynamic images
- **Color Fill/Stroke**: Modify fill and stroke colors dynamically
- **Font Management**: Handle custom fonts embedded in templates

### Key Components

#### ImageGenerationController
- **Endpoint**: `ImageGenerationEndpoint.GenerateImage`
- **Legacy Endpoint**: `media-gen.img.create` (for frontend compatibility)
- **Input Validation**: Uses Zod schemas for input validation
- **Error Handling**: Comprehensive error handling with logging

#### ImageGenerationService
- **Core Processing**: Orchestrates the entire image generation pipeline
- **Font Management**: Extracts and manages custom fonts from templates
- **File Storage**: Interfaces with MinIO for input/output file management
- **Format Conversion**: Converts SVG to PNG format using Sharp.js

#### SvgTransformationService
- **Element Transformation**: Applies various transformations to SVG elements
- **Text Alignment**: Supports horizontal (left, center, right) and vertical (top, center, bottom) alignment
- **Text Truncation**: Can truncate text to specified lengths
- **Case Conversion**: Supports uppercase, lowercase, or as-is text formatting
- **Image Rescaling**: Maintains aspect ratios during image replacement
- **Color Management**: Handles fill and stroke color transformations

## Data Flow

1. **Input Processing**: Receives input file key, output file key, and template data
2. **File Retrieval**: Downloads SVG template from MinIO
3. **DOM Parsing**: Parses SVG using JSDOM
4. **Font Extraction**: Extracts and saves embedded fonts
5. **Element Transformation**: Applies transformations based on `data-sprocket` attributes
6. **Image Generation**: Converts processed SVG to PNG format
7. **Storage**: Uploads both SVG and PNG versions to MinIO
8. **Response**: Returns the output file key

## Configuration

### Environment Variables
- **Transport URL**: RabbitMQ connection URL
- **Image Generation Queue**: Queue name for image generation tasks
- **MinIO Configuration**: Bucket names and connection details

### Dependencies
- **Sharp**: Image processing and format conversion
- **JSDOM**: SVG DOM manipulation
- **MinIO Client**: Object storage operations
- **Zod**: Runtime type validation

## API Endpoints

### Generate Image
- **Pattern**: `ImageGenerationEndpoint.GenerateImage`
- **Input**: `{ inputFile: string, outputFile: string, template: Template }`
- **Output**: `string` (output file key)
- **Description**: Processes an SVG template with provided data and generates both SVG and PNG outputs

## Error Handling
- Comprehensive validation using Zod schemas
- Graceful handling of missing fonts or images
- Proper error propagation with detailed logging
- Fallback mechanisms for unsupported transformations

## Performance Considerations
- Font caching for repeated template processing
- Concurrent processing of multiple transformations
- Efficient image format conversion
- Memory management for large SVG files

## Security Features
- Input validation prevents malicious SVG content
- Secure file operations with proper cleanup
- Authentication through RabbitMQ credentials

## Integration Points
- **MinIO**: For file storage and retrieval
- **RabbitMQ**: For message-based communication
- **Common Library**: Shared types and utilities from `@sprocketbot/common`

## Deployment
- **Container**: Docker-based deployment
- **Scalability**: Horizontal scaling through RabbitMQ load balancing
- **Monitoring**: Health checks and logging integration

## Testing
- Unit tests for transformation logic
- Integration tests with MinIO
- Schema validation tests
- Performance benchmarks for image processing

This service is essential for generating dynamic visual content throughout the Sprocket platform, enabling personalized images for user profiles, match results, and other dynamic content requirements.