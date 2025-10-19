#!/usr/bin/env python3
"""
Trustup24 LeadOps Agent - System Analysis Script
Analyzes the existing React app structure and functionality
"""

import os
import json
import re
import requests
from pathlib import Path

class Trustup24SystemAnalyzer:
    def __init__(self):
        self.base_path = Path("/home/ubuntu/trustup24-frontend")
        self.issues = []
        self.findings = []
        
    def analyze_react_structure(self):
        """Analyze the React app structure"""
        print("🔍 ANALYZING REACT APP STRUCTURE...")
        
        # Find main JS files
        assets_path = self.base_path / "assets"
        if assets_path.exists():
            js_files = list(assets_path.glob("*.js"))
            print(f"Found {len(js_files)} JavaScript files:")
            for js_file in js_files:
                print(f"  - {js_file.name} ({js_file.stat().st_size} bytes)")
                
                # Analyze file content
                try:
                    with open(js_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        self.analyze_js_content(js_file.name, content)
                except Exception as e:
                    self.issues.append(f"❌ Could not read {js_file.name}: {e}")
        else:
            self.issues.append("❌ No assets directory found")
    
    def analyze_js_content(self, filename, content):
        """Analyze JavaScript content for React components and functionality"""
        print(f"\n📊 ANALYZING {filename}...")
        
        # Look for React components
        component_patterns = [
            r'function\s+(\w+)\s*\(',
            r'const\s+(\w+)\s*=\s*\(',
            r'class\s+(\w+)\s+extends',
            r'export\s+default\s+(\w+)',
        ]
        
        components = set()
        for pattern in component_patterns:
            matches = re.findall(pattern, content)
            components.update(matches)
        
        if components:
            print(f"  📦 Found components: {', '.join(sorted(components))}")
            self.findings.append(f"Components in {filename}: {', '.join(sorted(components))}")
        
        # Look for routing
        if 'Router' in content or 'Route' in content:
            routes = re.findall(r'path=["\']([^"\']+)["\']', content)
            if routes:
                print(f"  🛣️  Found routes: {', '.join(routes)}")
                self.findings.append(f"Routes: {', '.join(routes)}")
        
        # Look for API calls
        api_patterns = [
            r'fetch\s*\(["\']([^"\']+)["\']',
            r'axios\.[get|post|put|delete]+\(["\']([^"\']+)["\']',
            r'supabase\.',
        ]
        
        for pattern in api_patterns:
            matches = re.findall(pattern, content)
            if matches:
                print(f"  🌐 API calls found: {', '.join(matches)}")
                self.findings.append(f"API calls in {filename}: {', '.join(matches)}")
        
        # Look for Supabase integration
        if 'supabase' in content.lower():
            print("  ✅ Supabase integration detected")
            self.findings.append(f"Supabase integration found in {filename}")
        
        # Look for form handling
        if 'onSubmit' in content or 'handleSubmit' in content:
            print("  📝 Form handling detected")
            self.findings.append(f"Form handling found in {filename}")
    
    def check_supabase_connection(self):
        """Check if Supabase is properly configured"""
        print("\n🗄️  CHECKING SUPABASE CONNECTION...")
        
        # Look for Supabase config
        config_files = ['supabase.js', 'config.js', '.env', '.env.local']
        supabase_found = False
        
        for config_file in config_files:
            config_path = self.base_path / config_file
            if config_path.exists():
                try:
                    with open(config_path, 'r') as f:
                        content = f.read()
                        if 'supabase' in content.lower():
                            print(f"  ✅ Supabase config found in {config_file}")
                            supabase_found = True
                            
                            # Extract URL and key patterns
                            url_match = re.search(r'supabase.*url.*["\']([^"\']+)["\']', content, re.IGNORECASE)
                            key_match = re.search(r'supabase.*key.*["\']([^"\']+)["\']', content, re.IGNORECASE)
                            
                            if url_match:
                                print(f"  🔗 Supabase URL pattern found")
                            if key_match:
                                print(f"  🔑 Supabase key pattern found")
                                
                except Exception as e:
                    self.issues.append(f"❌ Could not read {config_file}: {e}")
        
        if not supabase_found:
            self.issues.append("❌ No Supabase configuration found")
    
    def check_live_site_functionality(self):
        """Check if the live site is responding correctly"""
        print("\n🌐 CHECKING LIVE SITE FUNCTIONALITY...")
        
        base_url = "http://trustup24.ae"
        
        # Test main endpoints
        endpoints = [
            "/",
            "/anbieter-finden.html",
            "/matching-finden.html", 
            "/anbieter-vergleichen.html"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    print(f"  ✅ {endpoint} - Status: {response.status_code}")
                    
                    # Check for React app loading
                    if 'id="root"' in response.text:
                        print(f"    📦 React root element found")
                    
                    # Check for UX improvements script
                    if 'ux-improvements.js' in response.text:
                        print(f"    🔧 UX improvements script loaded")
                        
                else:
                    print(f"  ❌ {endpoint} - Status: {response.status_code}")
                    self.issues.append(f"HTTP {response.status_code} for {endpoint}")
                    
            except Exception as e:
                print(f"  ❌ {endpoint} - Error: {e}")
                self.issues.append(f"Connection error for {endpoint}: {e}")
    
    def check_seo_structure(self):
        """Check SEO elements in the HTML"""
        print("\n🎯 CHECKING SEO STRUCTURE...")
        
        try:
            response = requests.get("http://trustup24.ae", timeout=10)
            if response.status_code == 200:
                html = response.text
                
                # Check meta tags
                title_match = re.search(r'<title>([^<]+)</title>', html)
                if title_match:
                    print(f"  ✅ Title: {title_match.group(1)}")
                else:
                    self.issues.append("❌ No title tag found")
                
                # Check meta description
                desc_match = re.search(r'<meta name=["\']description["\'] content=["\']([^"\']+)["\']', html)
                if desc_match:
                    print(f"  ✅ Meta description found")
                else:
                    self.issues.append("❌ No meta description found")
                
                # Check for structured data
                if 'application/ld+json' in html:
                    print("  ✅ Structured data (JSON-LD) found")
                else:
                    print("  ⚠️  No structured data found")
                
        except Exception as e:
            self.issues.append(f"❌ Could not check SEO structure: {e}")
    
    def generate_report(self):
        """Generate comprehensive analysis report"""
        print("\n" + "="*60)
        print("📋 TRUSTUP24 SYSTEM ANALYSIS REPORT")
        print("="*60)
        
        print("\n✅ FINDINGS:")
        for finding in self.findings:
            print(f"  • {finding}")
        
        print(f"\n❌ ISSUES FOUND ({len(self.issues)}):")
        for issue in self.issues:
            print(f"  • {issue}")
        
        if not self.issues:
            print("  🎉 No critical issues found!")
        
        # Save report to file
        report_path = self.base_path / "system_analysis_report.txt"
        with open(report_path, 'w') as f:
            f.write("TRUSTUP24 SYSTEM ANALYSIS REPORT\n")
            f.write("="*40 + "\n\n")
            f.write("FINDINGS:\n")
            for finding in self.findings:
                f.write(f"• {finding}\n")
            f.write(f"\nISSUES ({len(self.issues)}):\n")
            for issue in self.issues:
                f.write(f"• {issue}\n")
        
        print(f"\n📄 Report saved to: {report_path}")
    
    def run_full_analysis(self):
        """Run complete system analysis"""
        print("🚀 STARTING TRUSTUP24 SYSTEM ANALYSIS...")
        print("="*60)
        
        self.analyze_react_structure()
        self.check_supabase_connection()
        self.check_live_site_functionality()
        self.check_seo_structure()
        self.generate_report()

if __name__ == "__main__":
    analyzer = Trustup24SystemAnalyzer()
    analyzer.run_full_analysis()
