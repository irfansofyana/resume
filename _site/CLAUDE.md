# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `bundle install` - Install Ruby dependencies
- `bundle exec jekyll serve` - Start local development server on localhost:4000
- `bundle exec jekyll build` - Build the static site

### Docker Development
- `./run-docker.sh` - Build and run the Jekyll server using Docker (recommended)
  - Automatically builds the Docker image
  - Starts Jekyll server on http://localhost:4000
  - Press Ctrl+C to stop
- `docker image build -t resume-template .` - Build Docker image only
- `docker run --rm --name resume-template -v "$PWD":/home/app --network host resume-template` - Run with Docker (manual)

## Architecture Overview

This is a Jekyll-based static website for hosting a professional resume. The site uses GitHub Pages for deployment and follows a conventional Jekyll structure.

### Key Directories and Files

- `_config.yml` - Main configuration file containing personal info, sections to display, and theme settings
- `_layouts/resume.html` - Main layout template defining the resume structure and sections
- `_data/` - Contains YAML files for resume content:
  - `experience.yml` - Work experience with companies and positions
  - `education.yml` - Educational background
  - `projects.yml` - Project portfolio
  - `skills.yml` - Technical skills organized by category
  - `certifications.yml` - Professional certifications
  - `recognitions.yml` - Awards and recognition
  - `associations.yml` - Professional associations
  - `links.yml` - Additional links
  - `interests.yml` - Personal interests
- `_includes/` - Reusable components (head.html, icon-links.html, etc.)
- `_sass/` - SASS stylesheets
- `images/` - Profile photo and other images

### Content Structure

The resume content is data-driven using YAML files in `_data/`. Each section in the resume corresponds to a YAML file and can be toggled on/off in `_config.yml`. The main layout (`_layouts/resume.html`) uses Liquid templating to render content from these data files.

### Customization

Personal information is primarily configured in `_config.yml`:
- Name, title, contact information
- Header introduction text
- Social media links
- Section visibility toggles
- Theme selection

Resume content is managed through the YAML data files, making it easy to update experience, education, skills, and other sections without modifying HTML templates.

### Deployment

The site is designed for GitHub Pages deployment. Ensure the repository is set up to serve from the `gh-pages` branch or main branch depending on GitHub Pages configuration.