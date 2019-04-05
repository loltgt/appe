<?php

$paths = ['src'];
$dirs = ['appe/src/js'];

$priorities = [
	0 => 'src:appe/src/js:index',
	10 => 'src:appe/src/js:os',
	20 => 'src:appe/src/js:controller',
	30 => 'src:appe/src/js:memory',
	40 => 'src:appe/src/js:store',
	50 => 'src:appe/src/js:start',
	60 => 'src:appe/src/js:main',
	70 => 'src:appe/src/js:view',
	80 => 'src:appe/src/js:layout',
	90 => 'src:appe/src/js:utils',
];

$namespaces = [
	'appe' => 'app'
];



if (! function_exists('array_key_last')) {
	function array_key_last($array = array()) {
		end($array);
		$_last = key($array);
		reset($array);

		return $_last;
	}
}

function dircm($file, $dir, $path) {
	global $priorities;

	if ($file[0] == '.' || strpos($file, '.js') == false)
		return false;

	$name = substr($file, 0, -3);
	$name = slugify($name);
	$name = $path . ':' . $dir . ':' . $name;

	$priority = array_search($name, $priorities, true);

	if ($priority === false) {
		$priority = array_key_last($priorities);
		$priority++;
		$priorities[$priority] = $name;
	}

	$dir && $dir .= '/';

	return [$dir . $file, $priority];
}


function fndlci($source, $token, $token_name) {
	$index = explode(PHP_EOL, $token[1]);
	$index = (count($index) - 1) + $token[2];

	$line = '';
	$comment = '';

	if ($token_name === 'T_DOC_COMMENT') {
		(isset($source[$index])) && $line = $source[$index];
		(isset($token[1])) && $comment = $token[1];

		for ($s = 1; $s < 3; $s++) {
			$l = $index + $s;

			if (! isset($source[$l]))
				continue;

			$line .= "\n" . $source[$l];
		}
	}

	return ['line' => $line, 'comment' => $comment, 'index' => $index];
}


function pcbbl($line, $args = null) {
	$lc = '';

	$line = preg_replace('/^[\s\s]\s/', '', $line);

	if (isset($line[0]) && $line[0] === '@')
		$lc = substr($line, 1, (($s = strpos($line, ' ')) ? ($s - 1) : strlen($line)));
	else if ($line === '...')
		$lc = 'type';

	$line = preg_replace('/^([\t]+|[\']+|\{|\})/', '', $line);

	if ($lc) {
		$line = explode(' ', $line);
		$line = array_map('trim', $line);
	}

	$r = null;


	switch ($lc) {
		case 'link':
			$r = "link to: [" . $line[1] . "](" . $line[1] . ")";
		break;

		case 'see':
			$r = "code refer to: *" . $line[1] . "*";
		break;

		case 'license':
			unset($line[0]);
			$r = "license: " . implode(' ', $line);
		break;

		case 'copyright':
			unset($line[0]);
			$r = "copyright: " . implode(' ', $line);
		break;

		case 'global':
		case 'type':
		case 'param':
			$lc = ($lc !== 'global' ? 'params' : 'globals');

			if (! empty($line[1]))
				$r = str_replace("|", " or ", $line[1]);
			else
				$r = "...";

			if (! empty($line[2])) {
				$r .= " " . $line[2];

				if ($lc !== 'globals' && ! empty($args[$line[2]]))
					$r .= "   default: " . $args[$line[2]];
			}

			if (! empty($line[4])) {
				$r .= "   reference: " . $line[4];
			}
		break;

		case 'return':
			if (! empty($line[1]))
				$r = str_replace("|", " or ", $line[1]);

			if (! empty($line[2]))
				$r .= " " . $line[2];

			if (! empty($line[4]))
				$r .= "   reference: " . str_replace("|", " or ", $line[4]);
		break;

		default:
			$r = $line;
	}

	return [$lc, $r];
}


function pcom($comment, $node = null) {
	$comm = str_replace(["/**", " */", " * ", " *", "// ", "\t"], "", $comment);
	$comm = explode(PHP_EOL, $comm);

	$args = null;

	if ($node) {
		$args = substr($node, (strpos($node, '(') + 2), (strrpos($node, ')') - strpos($node, '(') - 3));
		
		if ($args) {
			$_args = explode(', ', $args);
			$args = [];

			foreach ($_args as $arg) {
				if (strpos($arg, '=')) {
					$arg = preg_split('/\s=\s/', $arg);
					if (! isset($arg[1])) continue;
					$args[$arg[0]] = $arg[1];
				} else {
					$args[$arg] = '';
				}
			}
		}
	}

	$doc = ['line' => '', 'comment' => ''];

	$index = 0;
	$depth = "";
	$needsh = false;

	foreach ($comm as $i => $line) {
		if (empty($line)) continue;

		$bbl = pcbbl($line, $args);

		if (! $index++) {
			$doc['line'] = $bbl[1];

			continue;
		}

		($depth && is_int(strpos($line, '}'))) && $depth = "";

		if ($bbl[0] == 'params' || $bbl[0] == 'globals') {
			$doc[$bbl[0]][$i] = $depth . $bbl[1];

			(! $depth && is_int(strpos($line, '{'))) && $depth = "\t";
		} elseif ($bbl[0]) {
			$doc[$bbl[0]] = $bbl[1];
		} else {
			if (! $needsh && strrpos($line, ":") === (strlen($line) - 1)) {
				$doc['comment_sh'] = [0 => $bbl[1], 1 => ''];
				$needsh = true;
			} elseif ($needsh && is_int(strpos($line, " "))) {
				$doc['comment_sh'][1] .= $bbl[1] . "\n";
			} else {
				$doc['comment'] .= ($doc['comment'] ? "\n" : "") . $bbl[1];
				$needsh = false;
			}
		}
	}


	if (empty($doc['comment'])) {
		unset($doc['comment']);
	} elseif (strstr($doc['comment'], '//TODO')) {
		$doc['comment'] = explode('//TODO', $doc['comment']);
		$doc['todo'] = trim($doc['comment'][1]);
		$doc['comment'] = $doc['comment'][0];
	}

	return $doc;
}


function slugify($text) {
	$text = preg_replace('/[^A-Za-z0-9_-]+/', '-', $text);
	$text = preg_replace('/^-/', '', $text);

	return $text;
}





$diri = [];

foreach ($paths as $path) {
	$base = realpath(__DIR__ . '/../' . $path);

	foreach ($dirs as $dir) {
		$dirc = $base . '/' . $dir;

		if (! is_dir($dirc)) continue;

		foreach (scandir($dirc) as $file)
			(list($file, $priority) = dircm($file, $dir, $path)) && $diri[$priority] = [$path, $file, $priority];
	}
}

ksort($diri);


$docs = [];

foreach ($diri as $brs) {
	$path = $brs[0];
	$filename = $brs[1];
	$priority = $brs[2];

	$file = realpath(__DIR__ . '/../' . $path . '/' . $filename);

	$source = file_get_contents($file);
	$source = "<?php\r\n" . str_replace("/**!", "/**", $source);

	$tokens = token_get_all($source);
	$source = explode(PHP_EOL, $source);


	foreach ($tokens as $token) {

		if (! (isset($token[0]) && is_int($token[0]))) continue;

		$token_name = token_name($token[0]);

		if ($token_name !== 'T_DOC_COMMENT') continue;


		extract(fndlci($source, $token, $token_name));


		$doc = pcom($comment, $source[$index]);

		if (empty($doc)) continue;

		$f = explode('/', $filename);
		$f[0] = slugify($f[0]);
		$f[1] = slugify(substr($f[1], 0, -3));

		$sth = explode('.', $doc['line']);

		$is_prototype = isset($doc['comment']) && strstr($doc['comment'], 'prototype');
		$is_hook = isset($doc['line']) && strstr($doc['line'], 'hook');

		$descriptor = false;
		$category = $is_prototype ? 'Function.prototype' : 'Function';

		$three = slugify($namespaces[$f[0]]);
		$subthree = $is_hook ? 'Hooks' : (isset($sth[2]) ? $sth[1] : $sth[0]);
		$i = slugify($doc['line']);

		if (! isset($sth[2]) && ! $is_hook && $f[1] === $sth[1]) {
			$i = 0;
			$subthree = $sth[1];
			$sth[2] = true;
			$descriptor = true;
		}


		if (! isset($docs[$three][$subthree][$i]))
			$docs[$three][$subthree][$i] = $doc;

		$file_url = "https://github.com/loltgt/appe/blob/master/{$path}/{$filename}";

		$l = $index + 1;
		$line_url = "{$file_url}#L{$l}";


		$docs[$three][$subthree][$i]['descriptor'] = $descriptor;
		$docs[$three][$subthree][$i]['name'] = $is_hook ? str_replace(' hook', '', $doc['line']) : $doc['line'];
		$docs[$three][$subthree][$i]['parent'] = $is_hook ? 'Hooks' : (isset($sth[2]) ? $sth[0] . '.' . $sth[1] : (isset($sth[1]) ? $sth[0] : ''));
		$docs[$three][$subthree][$i]['child'] = $is_hook ? '' : $f[1];
		$docs[$three][$subthree][$i]['sth'] = $is_hook ? str_replace(' hook', '', $doc['line']) : (isset($sth[2]) ? $sth[2] : (isset($sth[1]) ? $sth[1] : $sth[0]));
		$docs[$three][$subthree][$i]['category'] = $category;
		$docs[$three][$subthree][$i]['file'] = $filename;
		$docs[$three][$subthree][$i]['position'][] = "- [{$path}/{$filename}]({$file_url})   line: [{$l}]({$line_url})";
		$docs[$three][$subthree][$i]['priority'] = $is_hook ? 9999 : $priority;

	}
}



$base = realpath(__DIR__ . '/appe');

$menu = [];

foreach ($docs as $three => $branch) {

	$node = $name = $three;
	$file = $base . '/wiki/' . $node . '.md';

	$body = "";
	$header = "";
	$list = [];


	foreach ($branch as $subthree => $doc) {

		$body = "";
		$header = "";
		$comment_heading = "###";

		foreach ($doc as $text) {

			if (! $header) {
				$parent = $text['parent'];

				$header .= "\n\n";
				$header .= "# {$parent}\n";
				$header .= "\n\n";

				$node = slugify($text['child']);
				$name = ($node ? $three . '-' . $node : slugify($text['parent']));

				$file = $base . '/docs/wiki/' . $name . '.md';


				$list[$text['priority']][] = "";
				$list[$text['priority']][] = "## [[{$parent}|{$name}]]";

				$menu[$text['priority']][] = "";
				$menu[$text['priority']][] = "## [[{$parent}|{$name}]]";
			}


			$node = $text['sth'];
			$anchor = str_replace('$', '', $text['name']);
			$anchor = urlencode($anchor);

			if (! $text['descriptor']) {
				$comment_heading = "####";

				$menu[$text['priority']][] = "* [[{$node}|{$name}#{$anchor}]]";
				$list[$text['priority']][] = "- [[{$node}|{$name}#{$anchor}]]";

				$body .= "## {$text['name']}\n\n";
			}
			

			if (isset($text['comment'])) {
				$text['comment'] = explode("\n", $text['comment']);

				foreach ($text['comment'] as $line) {
					$depth = preg_match('/^[\s]+/', $line);
					$depth = $depth ? str_pad('#', $depth) : '';
					$line = trim($line);
					$body .= "{$comment_heading}{$depth} {$line}\n";
				}
				$body .= "\n\n";
			}

			if (isset($text['todo'])) {
				$text['todo'] = "{$comment_heading} TODO: *" . $text['todo'] . "*";
				$body .= "{$text['todo']}\n\n";
			}

			if (isset($text['link']))
				$body .= "{$text['link']}\n\n";

			if (isset($text['see']))
				$body .= "{$text['see']}\n\n";

			if (isset($text['license']))
				$body .= "{$text['license']}\n\n";

			if (isset($text['copyright']))
				$body .= "{$text['copyright']}\n\n";

			if (isset($text['globals'])) {
				$text['globals'] = "globals: \n```js\n" . implode("\n", $text['globals']) . "\n```\n";
				$body .= "{$text['globals']}\n\n";
			}

			if (isset($text['params'])) {
				$params_label = "arguments";
				$text['params'] = "{$params_label}: \n```js\n" . implode("\n", $text['params']) . "\n```\n";
				$body .= "{$text['params']}\n\n";
			}

			if (isset($text['return'])) {
				if (empty($text['return']))
					$text['return'] = "returns.\n";
				else
					$text['return'] = "returns: \n```js\n" . $text['return'] . "\n```\n";

				$body .= "{$text['return']}\n\n";
			}

			if (isset($text['comment_sh'])) {
				$text['comment_sh'] = "{$text['comment_sh'][0]}\n```js\n{$text['comment_sh'][1]}```\n";
				$body .= "{$text['comment_sh']}\n\n";
			}

			if (isset($text['position'])) {
				$text['position'] = "position: \n" . implode("\n", $text['position']);
				$body .= "{$text['position']}\n\n";
			}

			$body .= " \n\n";

		}


		if ($body) file_put_contents($file, $header . $body);


	}


	if (! empty($list)) {
		$node = $name = $three;
		$file = $base . '/docs/wiki/' . $node . '.md';

		$header = "";
		$body = "";

		ksort($list);

		$header .= "\n\n";
		$header .= "# {$three}\n";
		$header .= "\n\n";

		foreach ($list as $items) $body .= implode("\n", $items) . "\n";
	}

	if ($body) file_put_contents($file, $header . $body);


}


ksort($menu);


$text  = "\n";
foreach ($menu as $item) $text .= implode("\n", $item) . "\n";
$text .= "\n";


file_put_contents($base . '/docs/wiki/_Sidebar.md', $text);


$home_text = file_get_contents($base . '/docs/_Home.md');

file_put_contents($base . '/docs/wiki/Home.md', $home_text . $text);



file_put_contents($base . '/docs.tmp', print_r($docs, true));
