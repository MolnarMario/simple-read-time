<?php
/**
 * Plugin Name: Simple Read Time
 * Description: Estimates and displays the reading time of a post based on its word count. Adjust reading speed under Settings → Read Time.
 * Version: 1.2.0
 * Author: You
 * License: GPL v2 or later
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

define( 'SRT_DEFAULT_WPM', 200 );

/**
 * Calculate estimated read time (in minutes, minimum 1) for a block of text.
 */
function srt_calculate_read_time( $content ) {
	$wpm         = (int) get_option( 'srt_wpm', SRT_DEFAULT_WPM );
	$wpm         = max( 1, $wpm );
	$plain_text  = wp_strip_all_tags( $content );
	$word_count  = str_word_count( $plain_text );
	$minutes     = (int) ceil( $word_count / $wpm );

	return max( 1, $minutes );
}

/**
 * Prepend the read time notice to single post content.
 */
function srt_display_read_time( $content ) {
	if ( is_singular( 'post' ) && in_the_loop() && is_main_query() ) {
		$minutes = srt_calculate_read_time( $content );
		$text    = sprintf(
			_n( '%d min read', '%d min read', $minutes, 'simple-read-time' ),
			$minutes
		);

		$notice  = '<p class="simple-read-time">&#128337; ' . esc_html( $text ) . '</p>';
		$content = $notice . $content;
	}

	return $content;
}
add_filter( 'the_content', 'srt_display_read_time' );

/**
 * A little default styling so it looks decent out of the box.
 */
function srt_inline_styles() {
	if ( is_singular( 'post' ) ) {
		echo '<style>
			.simple-read-time {
				font-size: 0.9em;
				color: #666;
				font-style: italic;
				margin-bottom: 1em;
			}
		</style>';
	}
}
add_action( 'wp_head', 'srt_inline_styles' );

/**
 * Register the "Reading Speed" setting.
 */
function srt_register_settings() {
	register_setting(
		'srt_settings_group',
		'srt_wpm',
		array(
			'type'              => 'integer',
			'sanitize_callback' => 'absint',
			'default'           => SRT_DEFAULT_WPM,
		)
	);
}
add_action( 'admin_init', 'srt_register_settings' );

/**
 * Add the settings page under Settings → Read Time.
 */
function srt_add_settings_page() {
	add_options_page(
		'Read Time Settings',
		'Read Time',
		'manage_options',
		'simple-read-time',
		'srt_render_settings_page'
	);
}
add_action( 'admin_menu', 'srt_add_settings_page' );

/**
 * Handle the "Reset to Default" button submission.
 */
function srt_handle_reset_request() {
	if ( ! isset( $_POST['srt_reset_wpm'] ) ) {
		return;
	}

	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	check_admin_referer( 'srt_reset_wpm_action', 'srt_reset_wpm_nonce' );

	update_option( 'srt_wpm', SRT_DEFAULT_WPM );

	wp_safe_redirect( add_query_arg( 'srt-reset', '1', wp_get_referer() ) );
	exit;
}
add_action( 'admin_init', 'srt_handle_reset_request' );

/**
 * Show a confirmation notice after a successful reset.
 */
function srt_reset_notice() {
	if ( isset( $_GET['srt-reset'] ) && '1' === $_GET['srt-reset'] ) {
		echo '<div class="notice notice-success is-dismissible"><p>'
			. esc_html( sprintf( 'Reading speed reset to default (%d WPM).', SRT_DEFAULT_WPM ) )
			. '</p></div>';
	}
}
add_action( 'admin_notices', 'srt_reset_notice' );

/**
 * Render the settings page.
 */
function srt_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1>Read Time Settings</h1>
		<form method="post" action="options.php">
			<?php settings_fields( 'srt_settings_group' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">
						<label for="srt_wpm">Average reading speed</label>
					</th>
					<td>
						<input
							type="number"
							id="srt_wpm"
							name="srt_wpm"
							min="1"
							step="1"
							value="<?php echo esc_attr( get_option( 'srt_wpm', SRT_DEFAULT_WPM ) ); ?>"
						/>
						<span> words per minute</span>
						<p class="description">
							Used to estimate read time on posts. Higher WPM = shorter estimated times. Default is 200.
						</p>
					</td>
				</tr>
			</table>
			<?php submit_button( 'Save Settings' ); ?>
		</form>
		<form method="post" action="">
			<?php wp_nonce_field( 'srt_reset_wpm_action', 'srt_reset_wpm_nonce' ); ?>
			<input type="hidden" name="srt_reset_wpm" value="1" />
			<?php submit_button( 'Reset to Default (200 WPM)', 'secondary', 'submit', false ); ?>
		</form>
	</div>
	<?php
}
